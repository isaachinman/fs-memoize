import fs from 'fs'
import { fsMemoize } from './index'

jest.mock('fs')

const mockFunction = async (_firstArg: string) => 'someExpensiveData'
const mockFunctionCached = fsMemoize(
  mockFunction,
  {
    cacheBaseKey: 'mockFunction',
    ttl: 1,
  },
)

describe('fsMemoize', () => {
  beforeEach(() => {
    (process.env as any).NODE_ENV = 'development'
  })

  it('returns unmemoized function in test env', async () => {
    (process.env as any).NODE_ENV = 'test'

    const data = await mockFunctionCached('stringArg')

    expect(data).toEqual('someExpensiveData')
    expect(fs.readFileSync).not.toHaveBeenCalled()
    expect(fs.existsSync).not.toHaveBeenCalled()
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  it('caches function result in filesystem', async () => {

    // Initial run, expecting cache miss
    const firstDataCall = await mockFunctionCached('someArguments')

    expect(firstDataCall).toEqual('someExpensiveData')

    expect(fs.readFileSync).not.toHaveBeenCalled()

    expect(fs.existsSync).toHaveBeenCalledTimes(2)
    expect(
      (fs.existsSync as jest.Mock).mock.calls[0][0]
    ).toEqual('/tmp/fs-memoize')
    expect(
      (fs.existsSync as jest.Mock).mock.calls[1][0]
    ).toEqual('/tmp/fs-memoize/mockFunction%5B%22someArguments%22%5D')

    expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
    expect((fs.writeFileSync as jest.Mock).mock.calls[0][0]).toEqual('/tmp/fs-memoize/mockFunction%5B%22someArguments%22%5D')
    expect((fs.writeFileSync as jest.Mock).mock.calls[1][0]).toEqual('/tmp/fs-memoize/mockFunction%5B%22someArguments%22%5D.ttl')

    // Second run, expecting cache hit
    ; (fs.writeFileSync as jest.Mock).mockClear()
    ; (fs.existsSync as jest.Mock).mockImplementation(() => true)
    ; (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('.ttl')) {
        return JSON.stringify(new Date(Date.now() + 1000))
      }
      return JSON.stringify('someExpensiveData')
    })

    const secondDataCall = await mockFunctionCached('someArguments')

    expect(firstDataCall).toEqual(secondDataCall)

    expect(fs.writeFileSync).not.toHaveBeenCalled()

    // Third run sometime in the future, expecting cache miss
    ; (fs.writeFileSync as jest.Mock).mockClear()
    ; (fs.existsSync as jest.Mock).mockImplementation(() => true)
    ; (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('.ttl')) {
        return JSON.stringify(new Date(Date.now() - 1000))
      }
      return JSON.stringify('someExpensiveData')
    })

    const thirdDataCall = await mockFunctionCached('someArguments')

    expect(firstDataCall).toEqual(thirdDataCall)

    expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
  })
})

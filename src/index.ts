import fs from 'fs'
import path from 'path'

const DEFAULT_CACHE_DIR = '/tmp/fs-memoize'
const TTL_EXTENSION = '.ttl'

type FsMemoizeConfig = {
  cacheBaseKey: string
  cacheDir?: string
  ttl: number
}

export const fsMemoize = <F extends (...args: any[]) => Promise<unknown>>(
  fn: F,
  {
    cacheBaseKey,
    cacheDir: cacheDirOverride,
    ttl,
  }: FsMemoizeConfig
) =>
    async (...args: Parameters<F>): Promise<ReturnType<F>> => {
      if (process.env.NODE_ENV === 'test') {
        return fn(...args)
      }

      const cacheDir = cacheDirOverride || DEFAULT_CACHE_DIR
      const cacheKey = `${cacheBaseKey}${encodeURIComponent(JSON.stringify(args))}`
      const contentPath = path.join(cacheDir, cacheKey)
      const ttlPath = `${contentPath}${TTL_EXTENSION}`

      const cacheMiss = async () => {
        const content = await fn(...args)
        fs.writeFileSync(contentPath, JSON.stringify(content))
        fs.writeFileSync(
          ttlPath,
          JSON.stringify(
            new Date(Date.now() + ttl)
          )
        )
        return content
      }

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir)
      }

      if (fs.existsSync(contentPath) && fs.existsSync(ttlPath)) {
        const ttl = new Date(
          JSON.parse(
            fs.readFileSync(ttlPath, 'utf8')
          )
        )

        if (ttl.valueOf() > new Date().valueOf()) {
          return JSON.parse(
            fs.readFileSync(contentPath, 'utf8')
          )
        } else {
          return cacheMiss()
        }
      } else {
        return cacheMiss()
      }
    }

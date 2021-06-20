// eslint-disable-next-line
module.exports = {
  clearMocks: true,
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageProvider: 'v8',
  coverageReporters: [
    'json',
    'lcov',
    'text',
  ],
  maxWorkers: 8,
  moduleDirectories: ['node_modules', '<rootDir>'],
  preset: 'ts-jest',
  rootDir: 'src',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
  },
}

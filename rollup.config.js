import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json'

const external = [
  ...Object.keys(pkg.devDependencies),
]

// eslint-disable-next-line import/no-default-export
export default {
  external,
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    nodeResolve(),
    typescript({
      exclude: '**/*.test.*',
      include: [
        'src/**/*',
      ],
    }),
  ],
}

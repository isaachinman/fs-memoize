# fs-memoize

**A simple, zero-dependency NodeJs filesystem memoizer.**

### Installation

```
yarn install fs-memoize
```

### Usage

```tsx
import { fsMemoize } from 'fs-memoize'

const myExpensiveFunction = async () => {
  // ...Does expensive stuff
}

const myExpensiveFunctionCached = fsMemoize(
  myExpensiveFunction,
  {
    cacheBaseName: 'myExpensiveFunction',
    ttl: 60 * 1000,
  }
)

```

### How it works

The `fsMemoize` function will return back a memoized version of your async function.

A cache key is generated based on `cacheBaseKey` + all function arguments, stringified.

Cache life is controlled via the `ttl` config option, in milliseconds.

Data, by default, is stored in `/tmp/fs-memoize`, but the location can be changed via the optional `cacheDir` config option.

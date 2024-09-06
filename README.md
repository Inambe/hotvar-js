# hotvar-js

NPM package to use [hotvar.com](https://hotvar.com) in JavaScript environments.

# What's included?

This package exports `HotVar` class which allows using of "variables" created on [hotvar.com](https://hotvar.com)

## `HotVar` class

### `constructor(options: Partial<Config> = {})`

The constructor takes a config object. Here's the config object with defaults:

```
const onVar new HotVar({
    /*
        enable real-time updates
    */
    live: false,

    /*
        default variables to get values of / listen
    */
    vars: [],

    /*
        the mode it's running in. `html` indicates it'll search for variables in the page and replace their contents with variables' values
    */
    mode: "html",

    /*
        function that gets called every time there's an update for variables. also runs when it first fetches the values
    */
    onChange: undefined
})
```

### `fetchMany(varNames: string[]): Values`

### `fetchOne(varName: string): ValueResponse`

### `destroy(): void`

Destroys socket connection if `live` was `true`.

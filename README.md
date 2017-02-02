# probe [![Build Status](https://travis-ci.org/Dashed/probe.svg)](https://travis-ci.org/Dashed/probe)

#  (DEPRECATED/UNMAINTAINED)

> `Probe` extends [Providence](https://github.com/dashed/providence) to add observation capabilities.

## Usage

```
$ npm install --save probe
```

## Why?

It's usually useful to attach an observer to a `path`, and call it whenever a change at the subset or superset of `path` occurs.

### API

### `Probe`

`Probe` extends [`Providence`](https://github.com/dashed/providence) constructor, and will have `Providence` API. See relevant `Providence` API docs: https://github.com/dashed/providence

### `Probe.prototype.observe(listener)`

- Add the function `listener` to listen for any changes at this Probe object's path (e.g. `probe.path()`).

- Be aware that observation isn't scoped to the root data; only at path.

- The `listener` function would be added to an internal lookup table that is shared among all Probe objects that inherit it.

- The `listener` function will be invoked with three arguments: `(newValue, oldValue, pathOriginChange)`

- Adding the same `listener` two or more times doesn't do anything.

- Returns `unsubcribe` function that may be called at most once.

**NOTE:** Shorthand for `Probe.prototype.on('any', listener)`

### `Probe.prototype.unobserve(listener)`

- Removes observer, `listener`, if it exists, at this Probe object's path.

- Returns `this` for chaining.

**NOTE:** Shorthand for `Probe.prototype.removeListener('any', listener)`


### `Probe.prototype.on(event, listener)`

- Add `listener` that'll be called whenever relevant `event` occurs at path  (e.g. `probe.path()`)..

- `event` may be one of: `any`, `update`, `add`, `remove`, or `delete`

- The `listener` function will be invoked with at most three arguments depending on the `event` subscribed:
    - `any` event: `(newValue, oldValue, pathOriginChange)`
    - `add` event: `(newValue, pathOriginChange)`
    - `remove` event: `(oldValue, pathOriginChange)`
    - `delete` event is alias of `remove` event

- `pathOriginChange` is the path of the origin probe object that made the change. This is always relative to root.

- `listener` function would be added to a lookup table that is shared among all Probe objects that inherit it.

- Adding the same `listener` two or more times doesn't do anything.

- Returns `unsubcribe` function that may be called at most once;
since it's associated with `.on()`, which was called.


### `Probe.prototype.once(event, listener)`

- Same semantics as `Probe.prototype.on(event, listener)`, except `listener` is only called at most once when `event` occurs at path  (e.g. `probe.path()`).

- Returns `unsubcribe` function that may be called at most once;
since it's associated with `.once()`, which was called. Once listener has been called, calling the `unsubcribe` function has no effect.


### `Probe.prototype.removeListener(event, listener)`

- Removes `listener`, if it exists, from `event`.

- If the same `listener` is observing another `event` at the same keypath, that listener will not be removed.

- `event` may be one of: `any`, `update`, `add`, `remove`, or `delete`

- Returns `this` for chaining.

### `Probe.prototype.removeListeners()`

- Remove any and all listeners from `event`.

- `event` may be one of: `any`, `update`, `add`, `remove`, or `delete`

- Returns `this` for chaining.

## License

MIT

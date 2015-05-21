# probe [![Build Status](https://travis-ci.org/Dashed/probe.svg)](https://travis-ci.org/Dashed/probe)

> `Probe` extends Providence to add observation capabilities.

## Usage

```
$ npm install --save probe
```

### API

### `Probe`

`Probe` extends `Providence` constructor. See relevant `Providence` API docs: https://github.com/dashed/providence

### `Probe.prototype.observe(listener)`

Add `listener` to listen for any changes at this Probe object's keypath.
Be aware that observation isn't scoped to the root data; only at keypath.

`listener` function would be added to a lookup table that is shared among all
Probe objects that inherit it.

Shorthand for `Probe.prototype.on('any', listener)`

### `Probe.prototype.unobserve(listener)`

Remove observer at this Probe object's keypath.

Shorthand for `Probe.prototype.removeListener('any', listener)`


### `Probe.prototype.on(event, listener)`

Add `listener` that'll be called whenever relevant event occurs at keypath.

`event` may be one of: any, update, swap, add, remove, delete

`listener` function would be added to a lookup table that is shared among all
Probe objects that inherit it.

Return `unsubcribe` function that may be called at most once; 
since it's associated with `.on()`, which was called.


### `Probe.prototype.once(event, listener)`

Add a `listener` that's only called once when event occurs.

`event` may be one of: any, update, swap, add, remove, delete

Return `unsubcribe` function that may be called at most once; 
since it's associated with `.on()`, which was called. Once listener has been called, 
the `unsubcribe` function will be defunct; and calling it has no effect.


### `Probe.prototype.removeListener(event, listener)`

Remove `listener`, if it exists, from `event`.
If the same listener is observing another `event` at the same keypath, that
listener will not be removed.

`event` may be one of: any, update, swap, add, remove, delete

Returns `this` for chaining.

### `Probe.prototype.removeListeners()`

Remove all listeners, if any, from event.

`event` may be one of: any, update, swap, add, remove, delete

Returns `this` for chaining.

## License

MIT

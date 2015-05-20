# prolefeed [![Build Status](https://travis-ci.org/Dashed/prolefeed.svg)](https://travis-ci.org/Dashed/prolefeed)

> `Prolefeed` extends Providence to add observation capabilities.

## Usage

```
$ npm install --save prolefeed
```

### API

### `Prolefeed`

`Prolefeed` extends `Providence` constructor. See relevant `Providence` API docs: https://github.com/dashed/providence

### `Prolefeed.prototype.observe(listener)`

Add `listener` to listen for any changes at this Prolefeed object's keypath.
Be aware that observation isn't scoped to the root data; only at keypath.

`listener` function would be added to a lookup table that is shared among all
Prolefeed objects that inherit it.

Shorthand for `Prolefeed.prototype.on('any', listener)`

### `Prolefeed.prototype.unobserve(listener)`

Remove observer at this Prolefeed object's keypath.

Shorthand for `Prolefeed.prototype.removeListener('any', listener)`


### `Prolefeed.prototype.on(event, listener)`

Add `listener` that'll be called whenever relevant event occurs at keypath.

`event` may be one of: any, update, swap, add, remove, delete

`listener` function would be added to a lookup table that is shared among all
Prolefeed objects that inherit it.

Return `unsubcribe` function that may be called at most once; 
since it's associated with `.on()`, which was called.


### `Prolefeed.prototype.once(event, listener)`

Add a `listener` that's only called once when event occurs.

`event` may be one of: any, update, swap, add, remove, delete

Return `unsubcribe` function that may be called at most once; 
since it's associated with `.on()`, which was called. Once listener has been called, 
the `unsubcribe` function will be defunct; and calling it has no effect.


### `Prolefeed.prototype.removeListener(event, listener)`

Remove `listener`, if it exists, from `event`.
If the same listener is observing another `event` at the same keypath, that
listener will not be removed.

`event` may be one of: any, update, swap, add, remove, delete

Returns `this` for chaining.

### `Prolefeed.prototype.removeListeners()`

Remove all listeners, if any, from event.

`event` may be one of: any, update, swap, add, remove, delete

Returns `this` for chaining.

## FAQ

### WTF is prolefeed?

Prolefeed is a Newspeak term in the novel *Nineteen Eighty-Four* written by George Orwell. It is any deliberately superficial literature, movies and music that were produced to keep the "proles" (i.e., proletariat) content and to prevent them from becoming too knowledgeable.

The proles are analogous to React Components.

Sources:
- https://en.wikipedia.org/wiki/Prolefeed

## License

MIT

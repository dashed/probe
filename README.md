# minitrue [![Build Status](https://travis-ci.org/Dashed/minitrue.svg?branch=master)](https://travis-ci.org/Dashed/minitrue)

> War is Peace
> 
> Freedom is Slavery
> 
> Ignorance is Strength
> 
> — **Ministry of Truth**

`minitrue` (Ministry of Truth) create `Prolefeed` objects.

`Prolefeed` extends Providence to unbox/box using a single object reference containing an Immutable Map, and as well as add observation capabilities.

All `Prolefeed` instances point to the single source of truth.

Any two `Prolefeed` objects with the same keypath will point to the same value.

## Usage

```
$ npm install --save minitrue
```

### API

### `minitrue`

Creates a `Prolefeed` object with `data` as its unboxed root data.
If `data` is not an `Immutable` collection, it'll be converted into one via
`Immutable.fromJS(data)`.

```js

const truth = minitrue({
    'two plus two': {
        answer: 'five'
    }
});
```

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

### WTF is minitrue?

 `minitrue`, otherwise known as the Ministry of Truth, is an organization in George Orwell's novel, *Nineteen Eighty-Four*, that manages propaganda within a region called Oceania.

Prolefeed is any deliberately superficial literature, movies and music that were produced to keep the "proles" (i.e., proletariat) content and to prevent them from becoming too knowledgeable.

The proles are analogous to React Components.

Sources: 
- https://en.wikipedia.org/wiki/Ministry_of_Truth 
- https://en.wikipedia.org/wiki/Prolefeed

## License

MIT

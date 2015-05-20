const Immutable = require('immutable');
const { Iterable } = Immutable;
const Providence = require('providence');

const { newKeyPath } = Providence.prototype.__utils;

/* constants */
// sentinel values
const NOT_SET = {};
const LISTENERS = {}; // listen to any change
const LISTENERS_UPDATED = {};
const LISTENERS_DELETED = {};
const LISTENERS_ADDED = {};

const LISTENERS_PATH = [LISTENERS];
const KEYPATH_PATH = ['keyPath'];
const _ONUPDATE_PATH = ['_onUpdate']; // internal _onUpdate

module.exports = Prolefeed;

function makeProlefeed(...args) {
    return new Prolefeed(...args);
}

/**
 * Prolefeed constructor with the same argument input as the Prolefeed constructor.
 */
function Prolefeed() {

    // TODO: add test case for this
    if(!(this instanceof Prolefeed)) {
        return makeProlefeed.apply(null, arguments);
    }

    Providence.apply(this, arguments);

    let options = this._options;

    if(!options.hasIn(_ONUPDATE_PATH)) {

        const _onUpdate = function(options, keyPath, newRoot, oldRoot) {
            // TODO: add test case for propagate
            notifyListeners(options, keyPath, newRoot, oldRoot, options.get('propagate', true));
        };

        this._options = options = options.setIn(_ONUPDATE_PATH, _onUpdate);
    }

    if(!options.hasIn(LISTENERS_PATH)) {
        // a reference plain object is used so that it is shared among all Prolefeed
        // objects that inherit it.
        this._options = options.setIn(LISTENERS_PATH, {
            data: Immutable.Map()
        });
    }
}

let ProlefeedPrototype = Object.create(Providence.prototype);
Prolefeed.prototype = ProlefeedPrototype;

ProlefeedPrototype.constructor = Prolefeed;

/**
 * Add observer/listener to listen for changes at this Prolefeed object's keypath.
 * Be aware that observation isn't scoped to the root data.
 *
 * listener function would be added to a lookup table that is shared among all
 * Prolefeed objects that inherit it.
 *
 * @param  {Function} listener
 * @return {Function}          Returns unobserve function.
 */
ProlefeedPrototype.observe = function(listener) {
    return this.on('any', listener);
}

/**
 * Remove observer at this Prolefeed object's keypath.
 *
 * @param  {Function} listener
 * @return {Bool}          Returns true if unobserve is successful; false otherwise.
 */
ProlefeedPrototype.unobserve = function(listener) {
    return this.removeListener('any', listener);
}
/**
 * Add listener that'll be called whenever event occurs at keypath.
 *
 * event may be one of: any, update, swap, add, remove, delete
 *
 * listener function would be added to a lookup table that is shared among all
 * Prolefeed objects that inherit it.
 *
 * @param  {String} event
 * @param  {Function} listener
 * @return {Function}          Return unsubcribe function that may be called at
 *                             most once; since it's associated with .on(), which
 *                             was called.
 */
ProlefeedPrototype.on = function(event, listener) {
    const listenerKey = fetchListenerKey(event);
    const options = this._options;

    // unbox listeners
    const boxed = options.getIn(LISTENERS_PATH);
    const listeners = boxed.data;
    const keyPath = options.getIn(KEYPATH_PATH);

    const listenerKeyPath = newKeyPath(keyPath, [listenerKey, listener]);

    if(!listeners.hasIn(listenerKeyPath)) {
        boxed.data = listeners.setIn(listenerKeyPath, listener);
    }

    let unsubbed = false;
    return (/* unobserve */) => {
        if(!unsubbed) {
            unsubbed = true;
            this.removeListener(event, listener);
        }
    };
}

/**
 * Add a listener that's only called once when event occurs.
 *
 * event may be one of: any, update, swap, add, remove, delete
 *
 * @param  {String} event
 * @param  {Function} listener
 * @return {Function}          Return unsubcribe function that may be called at
 *                             most once; since it's associated with .on(), which
 *                             was called. Once listener has been called, the
 *                             unsubcribe function will be defunct; and calling it
 *                             has no effect.
 */
ProlefeedPrototype.once = function(event, listener) {
    let unsubscribe;
    let executed = false;

    const wrapped = function() {
        if(!executed && typeof unsubscribe === 'function') {
            executed = true;
            listener.apply(null, arguments);
            unsubscribe();
        }
    };

    return (unsubscribe = this.on(event, wrapped));
}

/**
 * Remove listener, if it exists, from event.
 * If the same listener is observing another event at the same keypath, that
 * listener will not be removed.
 *
 * event may be one of: any, update, swap, add, remove, delete
 *
 * Returns this for chaining.
 *
 * @param  {String} event
 * @param  {[type]} listener
 * @return {Prolefeed}
 */
ProlefeedPrototype.removeListener = function(event, listener) {
    const listenerKey = fetchListenerKey(event);
    deletePathListeners.call(this, [listenerKey, listener]);
    return this;
}

/**
 * Remove all listeners, if any, from event.
 *
 * event may be one of: any, update, swap, add, remove, delete
 *
 * Returns this for chaining.
 *
 * @param  {String} event
 * @return {Prolefeed}
 */
ProlefeedPrototype.removeListeners = function(event) {
    const listenerKey = fetchListenerKey(event);
    deletePathListeners.call(this, [listenerKey]);
    return this;
}

/* helpers */

function deletePathListeners(pathToDelete) {
    const options = this._options;

    // unbox listeners
    const boxed = options.getIn(LISTENERS_PATH);
    const listeners = boxed.data;
    const keyPath = options.getIn(KEYPATH_PATH);

    const listenerKeyPath = newKeyPath(keyPath, pathToDelete);

    boxed.data = listeners.deleteIn(listenerKeyPath);
}

function fetchListenerKey(event) {

    let listenerKey;
    event = event.toLowerCase();

    switch(event) {
        case 'any':
            listenerKey = LISTENERS;
            break;
        case 'update':
        case 'swap':
            listenerKey = LISTENERS_UPDATED;
            break;
        case 'add':
            listenerKey = LISTENERS_ADDED;
            break;
        case 'delete':
        case 'remove':
            listenerKey = LISTENERS_DELETED;
            break;
        default:
            throw Error(`Invalid event: ${event}. Must be one of: any, update, swap, add, delete`);
            break;
    }
    return listenerKey;
}

// observation helpers
function callObservers(ctxObservers, observers, args) {
    if(ctxObservers === NOT_SET) {
        return;
    }
    observers.count++;
    ctxObservers.forEach(function(fn) {
        fn.apply(null, args);
    });
}

function callListeners(observers, currentNew, currentOld) {

    const newSet = currentNew !== NOT_SET;
    const oldSet = currentOld !== NOT_SET;
    const __currentNew = newSet ? currentNew : void 0;
    const __currentOld = oldSet ? currentOld : void 0;
    const args = [__currentNew, __currentOld];
    const {
        observersAny,
        observersAdd,
        observersUpdate,
        observersDelete } = observers;

    if(oldSet && newSet) {
        callObservers(observersUpdate, observers, args);
    } else if(!oldSet && newSet) {
        callObservers(observersAdd, observers, args);
    } else if(oldSet && !newSet) {
        callObservers(observersDelete, observers, args);
    }
    callObservers(observersAny, observers, args);
}

function notifyListeners(options, keyPath, newRoot, oldRoot, propagate = true) {

    // fetch listeners
    const boxed = options.getIn(LISTENERS_PATH);
    const listeners = boxed.data;

    let current = listeners;
    let currentNew = newRoot;
    let currentOld = oldRoot;
    let n = 0;
    let len = keyPath.length;

    // notify listeners for every subpath of keyPath
    //
    // invariant:
    // current !== NOT_SET  => there are listeners in current and subtrees of current
    // currentOld !== currentNew => current subtrees are different
    while(current !== NOT_SET && currentOld !== currentNew && n < len) {

        if(propagate) {
            callListeners(extractListeners(current), currentNew, currentOld);
        }

        const atom = keyPath[n++];
        current = current.get(atom, NOT_SET);
        currentNew = currentNew === NOT_SET ? NOT_SET : currentNew.get(atom, NOT_SET);
        currentOld = currentOld === NOT_SET ? NOT_SET : currentOld.get(atom, NOT_SET);
    }

    return __notifyListeners(current, currentNew, currentOld, propagate);
}

/**
 * Call observers in listeners using currentNew and currentOld.
 * If propagate is true, and if either currentNew or currentOld is an Immutable object,
 * then recursively call __notifyListeners when keys of listeners intersect with the union
 * of the keys of currentNew and currentOld. The recursion is done in depth-first search manner.
 *
 * @param  {Immutable Map|Object}  listeners  [description]
 * @param  {any}  currentNew [description]
 * @param  {any}  currentOld [description]
 * @param  {Boolean} propagate  [description]
 */
// TODO: refactor listeners.forEach as abstracted function
function __notifyListeners(listeners, currentNew, currentOld, propagate = true) {

    if(currentOld === currentNew || listeners === NOT_SET) {
        return;
    }

    let observers = extractListeners(listeners);
    callListeners(observers, currentNew, currentOld);
    const listenersSize = listeners.size - observers.count;

    if(!propagate || listenersSize <= 0) {
        return;
    }

    const isImmutableNew = currentNew === NOT_SET ? false : Iterable.isIterable(currentNew);
    const isImmutableOld = currentOld === NOT_SET ? false : Iterable.isIterable(currentOld);

    if(!isImmutableNew && !isImmutableOld) {
        return;
    }

    // case: value changed from/to non-Immutable value to/from Immutable object
    if(!isImmutableNew || !isImmutableOld) {

        const tree = isImmutableNew ? currentNew : currentOld;
        const isNew = tree === currentNew;
        const isOld = tree === currentOld;

        if(tree.size <= listenersSize) {
            tree.forEach(function(value, key) {
                const subListeners = listeners.get(key, NOT_SET);
                if(subListeners === NOT_SET) {
                    return;
                }

                const __currentNew = isNew ? value : NOT_SET;
                const __currentOld = isOld ? value : NOT_SET;
                __notifyListeners(subListeners, __currentNew, __currentOld);
            });
            return;
        }

        listeners.forEach(function(subListeners, key) {

            if(skipListenerKey(key)) {
                return;
            }

            const __currentNew = isNew ? tree.get(key, NOT_SET) : NOT_SET;
            const __currentOld = isOld ? tree.get(key, NOT_SET) : NOT_SET;
            __notifyListeners(subListeners, __currentNew, __currentOld);
        });
        return;
    }

    // NOTE: invariant: currentNew and currentOld are both immutable objects
    // ideally the set of keys to traverse is:
    // [currentNew.keys() union currentOld.keys()] intersection listeners.keys()

    const newSize = currentNew.size;
    const oldSize = currentOld.size;

    if(newSize <= 0 && oldSize <= 0) {
        return;
    }

    // TODO: better heuristic? l*log(n*o) <= o*log(l*n) + n*log(l*o)
    if(listenersSize <= (newSize + oldSize)) {
        listeners.forEach(function(subListeners, key) {

            if(skipListenerKey(key)) {
                return;
            }

            const __currentNew = currentNew.get(key, NOT_SET);
            const __currentOld = currentOld.get(key, NOT_SET);
            __notifyListeners(subListeners, __currentNew, __currentOld);
        });
        return;
    }

    currentNew.forEach(function(__currentNew, key) {
        const subListeners = listeners.get(key, NOT_SET);
        if(subListeners === NOT_SET) {
            return;
        }

        const __currentOld = currentOld.get(key, NOT_SET);
        __notifyListeners(subListeners, __currentNew, __currentOld);
    });

    currentOld.forEach(function(__currentOld, key) {
        const __currentNew = currentNew.get(key, NOT_SET);
        if(__currentNew !== NOT_SET) {
            return;
        }

        const subListeners = listeners.get(key, NOT_SET);
        if(subListeners === NOT_SET) {
            return;
        }
        __notifyListeners(subListeners, __currentNew, __currentOld);
    });

    // NOTE: refactored into above code to reduce number of iterations on number of keys
    //
    // Immutable.Set(currentNew.keySeq()).union(currentOld.keySeq()).forEach(function(key) {
    //     const subListeners = listeners.get(key, NOT_SET);
    //     if(subListeners === NOT_SET) {
    //         return;
    //     }

    //     const __currentNew = currentNew.get(key, NOT_SET);
    //     const __currentOld = currentOld.get(key, NOT_SET);
    //     __notifyListeners(subListeners, __currentNew, __currentOld);
    // });
}

function skipListenerKey(key) {
    switch(key) {
        case LISTENERS:
        case LISTENERS_UPDATED:
        case LISTENERS_ADDED:
        case LISTENERS_DELETED:
            return true;
    }
    return false;
}

function extractListeners(listeners) {
    return {
        observersAny: listeners.get(LISTENERS, NOT_SET),
        observersAdd: listeners.get(LISTENERS_ADDED, NOT_SET),
        observersUpdate: listeners.get(LISTENERS_UPDATED, NOT_SET),
        observersDelete: listeners.get(LISTENERS_DELETED, NOT_SET),
        count: 0
    };
}

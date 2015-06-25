const chai = require('chai');
const expect = chai.expect;

const Immutable = require('immutable');
const { Map } = Immutable;

const Probe = require('../src');
const Providence = require('providence');

describe('Probe', function() {

    let options;

    beforeEach(function() {
        options = {
            root: {
                data: Immutable.Map()
            }
        };
    });

    it('should be instance of Providence and Probe', function() {
        const cursor = new Probe(options);
        expect(cursor instanceof Probe).to.be.true;
        expect(cursor instanceof Providence).to.be.true;
    });

    it('should install _onUpdate', function() {
        const cursor = new Probe(options);
        const _options = cursor.options();
        const _onUpdate = _options.get('_onUpdate');
        expect(_onUpdate).to.be.a('function');
    });

    it('should call observing function on update', function() {
        let calls = 0;
        const cursor = new Probe(options);
        const ret = cursor.observe(function() {
            calls++;
        });
        cursor.update((m) => m.set('foo', 'bar'));
        expect(calls).to.equal(1);
        expect(ret).to.be.a('function');
    });

    describe('observe updated subtree', function() {

        describe('observe change from existing non-Immutable value to non-Immutable value', thinfatListeners([0, 2-1+1], function(numDummy) {

            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({
                x: {
                    y: {
                        z: 'foo'
                    }
                }
            });

            const cursor = new Probe(options);
            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { z: 'bar' } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: 'foo' } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { z: 'bar' } });
                expect(oldValue.toJS()).to.eql({ y: { z: 'foo' } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // current tree observe
            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ z: 'bar' });
                expect(oldValue.toJS()).to.eql({ z: 'foo' });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            let n = numDummy;
            while(n-- > 0) {
                captureEmit(cursorY.cursor(n), ['any', 'update', 'add', 'delete', 'remove'], function() {
                    badCalls++;
                });
            }

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('bar');
                expect(oldValue).to.equal('foo');
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            cursorY.update((m) => m.set('z', 'bar'));
            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        }));

        describe('observe change from existing non-Immutable value to an Immutable Object', thinfatListeners([0, 6-3+1], function(numDummy) {
            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({ x: { y: { z: { subtree: {
                foo: 'foo',
                foo2: 'foo2',
                foo3: 'foo3'
            } } } } });
            const cursor = new Probe(options);

            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } } } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } });
                expect(oldValue.toJS()).to.eql({ y: { z: { subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // current tree observe
            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } });
                expect(oldValue.toJS()).to.eql({ z: { subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } });
                expect(oldValue.toJS()).to.eql({ subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            const subtree = cursorZ.cursor('subtree');

            let n = numDummy;
            while(n-- > 0) {
                captureEmit(subtree.cursor(n), ['any', 'update', 'add', 'delete', 'remove'], function() {
                    badCalls++;
                });
            }

            // subtree observe
            expectedCalls += captureEmit(subtree, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                });
                expect(oldValue.toJS()).to.eql({
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(subtree, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 1: The number of children at [x, y, z, subtree, foo] in newRoot shall be the same
            // as the number of children at [x, y, z, subtree, foo] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo', 'a']), ['any', 'add'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('a');
                expect(oldValue).to.equal(void 0);
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo', 'a']), ['update', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 2: The number of children at [x, y, z, subtree, foo2] in newRoot shall be less
            // than the number of children at [x, y, z, subtree, foo2] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo2', 'a']), ['any', 'add'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('a');
                expect(oldValue).to.equal(void 0);
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo2', 'a']), ['update', 'remove', 'delete'], function() {
                badCalls++;
            });

            captureEmit(subtree.cursor(['foo2', 'b']), ['any', 'delete', 'update', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 3: The number of children at [x, y, z, subtree, foo3] in newRoot shall be more
            // than the number of children at [x, y, z, subtree, foo3] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo3', 'a']), ['any', 'add'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('a');
                expect(oldValue).to.equal(void 0);
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo3', 'a']), ['update', 'remove', 'delete'], function() {
                badCalls++;
            });

            cursorY.update((m) => {

                // case: 1.1
                m = m.setIn(['z', 'subtree', 'foo'], Immutable.fromJS({
                    a: 'a'
                }));

                // case: 1.2
                m = m.setIn(['z', 'subtree', 'foo2'], Immutable.fromJS({
                    a: 'a'
                }));

                // case: 1.3
                m = m.setIn(['z', 'subtree', 'foo3'], Immutable.fromJS({
                    a: 'a',
                    b: 'b'
                }));

                return m;
            });

            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        }));

        describe('observe change from existing Immutable Object to non-Immutable value', thinfatListeners([0, 6-3+1], function(numDummy) {
            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({ x: { y: { z: { subtree: {
                foo: {
                    a: 'a'
                },
                foo2: {
                    a: 'a'
                },
                foo3: {
                    a: 'a',
                    b: 'b'
                }
            } } } } });
            const cursor = new Probe(options);

            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } } } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { z: { subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } } } });
                expect(oldValue.toJS()).to.eql({ y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } });
                expect(path).to.eql(['y']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // current tree observe
            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ z: { subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } } });
                expect(oldValue.toJS()).to.eql({ z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ subtree: {
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                } });
                expect(oldValue.toJS()).to.eql({ subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            const subtree = cursorZ.cursor('subtree');

            let n = numDummy;
            while(n-- > 0) {
                captureEmit(subtree.cursor(n), ['any', 'update', 'add', 'delete', 'remove'], function() {
                    badCalls++;
                });
            }

            // subtree observe
            expectedCalls += captureEmit(subtree, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({
                    foo: 'foo',
                    foo2: 'foo2',
                    foo3: 'foo3'
                });
                expect(oldValue.toJS()).to.eql({
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 1: The number of children at [x, y, z, subtree, foo] in oldRoot shall be the same
            // as the number of children at [x, y, z, subtree, foo] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo', 'a']), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('a');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo', 'a']), ['update', 'add'], function() {
                badCalls++;
            });

            // case 2: The number of children at [x, y, z, subtree, foo2] in oldRoot shall be less
            // than the number of children at [x, y, z, subtree, foo2] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo2', 'a']), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('a');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo2', 'a']), ['update', 'add'], function() {
                badCalls++;
            });

            captureEmit(subtree.cursor(['foo2', 'b']), ['any', 'delete', 'update', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 3: The number of children at [x, y, z, subtree, foo3] in oldRoot shall be more
            // than the number of children at [x, y, z, subtree, foo3] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo3', 'a']), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('a');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo3', 'a']), ['update', 'add'], function() {
                badCalls++;
            });

            cursorY.update((m) => {

                // case: 1.1
                m = m.setIn(['z', 'subtree', 'foo'], 'foo');

                // case: 1.2
                m = m.setIn(['z', 'subtree', 'foo2'], 'foo2');

                // case: 1.3
                m = m.setIn(['z', 'subtree', 'foo3'], 'foo3');

                return m;
            });

            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        }));

        describe('observe a newly inserted Immutable Object', thinfatListeners([0, 3-3+1], function(numDummy) {
            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({ x: { y: { z: { subtree: {
            } } } } });
            const cursor = new Probe(options);

            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                } } } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } });
                expect(oldValue.toJS()).to.eql({ y: { z: { subtree: {
                } } } });
                expect(path).to.eql(['y']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // current tree observe
            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } });
                expect(oldValue.toJS()).to.eql({ z: { subtree: {
                } } });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } });
                expect(oldValue.toJS()).to.eql({ subtree: {
                } });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            const subtree = cursorZ.cursor('subtree');

            let n = numDummy;
            while(n-- > 0) {
                captureEmit(subtree.cursor(n), ['any', 'update', 'add', 'delete', 'remove'], function() {
                    badCalls++;
                });
            }

            // subtree observe
            expectedCalls += captureEmit(subtree, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                });
                expect(oldValue.toJS()).to.eql({
                });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 1: The number of children at [x, y, z, subtree, foo] in newRoot shall be the same
            // as the number of children at [x, y, z, subtree, foo] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo', 'a']), ['any', 'add'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('a');
                expect(oldValue).to.equal(void 0);
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo', 'a']), ['update', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 2: The number of children at [x, y, z, subtree, foo2] in newRoot shall be less
            // than the number of children at [x, y, z, subtree, foo2] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo2', 'a']), ['any', 'add'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('a');
                expect(oldValue).to.equal(void 0);
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo2', 'a']), ['update', 'remove', 'delete'], function() {
                badCalls++;
            });

            captureEmit(subtree.cursor(['foo2', 'b']), ['any', 'delete', 'update', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 3: The number of children at [x, y, z, subtree, foo3] in newRoot shall be more
            // than the number of children at [x, y, z, subtree, foo3] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo3', 'a']), ['any', 'add'], function(newValue, oldValue, path) {
                expect(newValue).to.equal('a');
                expect(oldValue).to.equal(void 0);
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo3', 'a']), ['update', 'remove', 'delete'], function() {
                badCalls++;
            });

            cursorY.update((m) => {

                // case: 1
                m = m.setIn(['z', 'subtree', 'foo'], Immutable.fromJS({
                    a: 'a'
                }));

                // case: 2
                m = m.setIn(['z', 'subtree', 'foo2'], Immutable.fromJS({
                    a: 'a'
                }));

                // case: 3
                m = m.setIn(['z', 'subtree', 'foo3'], Immutable.fromJS({
                    a: 'a',
                    b: 'b'
                }));

                return m;
            });

            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        }));

        describe('observe deleted Immutable Object', thinfatListeners([0, 3-3+1], function(numDummy) {
            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({ x: { y: { z: { subtree: {
                foo: {
                    a: 'a'
                },
                foo2: {
                    a: 'a'
                },
                foo3: {
                    a: 'a',
                    b: 'b'
                }
            } } } } });
            const cursor = new Probe(options);

            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                } } } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } } });
                expect(path).to.eql(['x', 'y']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { z: { subtree: {
                } } } });
                expect(oldValue.toJS()).to.eql({ y: { z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } } });
                expect(path).to.eql(['y']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // current tree observe
            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ z: { subtree: {
                } } });
                expect(oldValue.toJS()).to.eql({ z: { subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } } });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ subtree: {
                } });
                expect(oldValue.toJS()).to.eql({ subtree: {
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                } });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            const subtree = cursorZ.cursor('subtree');

            let n = numDummy;
            while(n-- > 0) {
                captureEmit(subtree.cursor(n), ['any', 'update', 'add', 'delete', 'remove'], function() {
                    badCalls++;
                });
            }

            // subtree observe
            expectedCalls += captureEmit(subtree, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({
                });
                expect(oldValue.toJS()).to.eql({
                    foo: {
                        a: 'a'
                    },
                    foo2: {
                        a: 'a'
                    },
                    foo3: {
                        a: 'a',
                        b: 'b'
                    }
                });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 1: The number of children at [x, y, z, subtree, foo] in oldRoot shall be the same
            // as the number of children at [x, y, z, subtree, foo] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo', 'a']), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('a');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo', 'a']), ['update', 'add'], function() {
                badCalls++;
            });

            // case 2: The number of children at [x, y, z, subtree, foo2] in oldRoot shall be less
            // than the number of children at [x, y, z, subtree, foo2] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo2', 'a']), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('a');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo2', 'a']), ['update', 'add'], function() {
                badCalls++;
            });

            captureEmit(subtree.cursor(['foo2', 'b']), ['any', 'delete', 'update', 'remove', 'delete'], function() {
                badCalls++;
            });

            // case 3: The number of children at [x, y, z, subtree, foo3] in oldRoot shall be more
            // than the number of children at [x, y, z, subtree, foo3] for the listener map.
            expectedCalls += captureEmit(subtree.cursor(['foo3', 'a']), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('a');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(subtree.cursor(['foo3', 'a']), ['update', 'add'], function() {
                badCalls++;
            });

            cursorY.update((m) => {

                // case: 1
                m = m.deleteIn(['z', 'subtree', 'foo']);

                // case: 2
                m = m.deleteIn(['z', 'subtree', 'foo2']);

                // case: 3
                m = m.deleteIn(['z', 'subtree', 'foo3']);

                return m;
            });

            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        }));
    });

    describe('observe deletes', function() {

        it('observe delete of non-Immutable value', function() {

            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({
                x: {
                    y: {
                        z: 'foo'
                    }
                }
            });

            const cursor = new Probe(options);
            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: 'foo' } } });
                expect(path).to.eql(['x', 'y', 'z']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { } });
                expect(oldValue.toJS()).to.eql({ y: { z: 'foo' } });
                expect(path).to.eql(['y', 'z']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ });
                expect(oldValue.toJS()).to.eql({ z: 'foo' });
                expect(path).to.eql(['z']);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('foo');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'update'], function() {
                badCalls++;
            });

            cursorZ.delete();
            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        });

        describe('observe delete of Immutable Object', thinfatListeners([0, 2-0+1], function(numDummy) {

            let calls = 0;
            let expectedCalls = 0;
            let badCalls = 0;
            options.root.data = Immutable.fromJS({
                x: {
                    y: {
                        z: {
                            foo: 'foo',
                            foo2: 'foo2'
                        }
                    }
                }
            });

            const cursor = new Probe(options);
            const cursorX = cursor.cursor(['x']);
            const cursorY = cursorX.cursor('y');
            const cursorZ = cursorY.cursor('z');

            // subpath observe
            expectedCalls += captureEmit(cursor, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ x: { y: { } } });
                expect(oldValue.toJS()).to.eql({ x: { y: { z: {
                    foo: 'foo',
                    foo2: 'foo2'
                } } } });
                expect(path).to.eql(['x', 'y', 'z']);
                calls++;
            });
            captureEmit(cursor, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subpath observe
            expectedCalls += captureEmit(cursorX, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ y: { } });
                expect(oldValue.toJS()).to.eql({ y: { z: {
                    foo: 'foo',
                    foo2: 'foo2'
                } } });
                expect(path).to.eql(['y', 'z']);
                calls++;
            });
            captureEmit(cursorX, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            expectedCalls += captureEmit(cursorY, ['any', 'update'], function(newValue, oldValue, path) {
                expect(newValue.toJS()).to.eql({ });
                expect(oldValue.toJS()).to.eql({ z: {
                    foo: 'foo',
                    foo2: 'foo2'
                } });
                expect(path).to.eql(['z']);
                calls++;
            });
            captureEmit(cursorY, ['add', 'remove', 'delete'], function() {
                badCalls++;
            });

            // subtree observe
            expectedCalls += captureEmit(cursorZ, ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue.toJS()).to.eql({
                    foo: 'foo',
                    foo2: 'foo2'
                });
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorZ, ['add', 'update'], function() {
                badCalls++;
            });

            let n = numDummy;
            while(n-- > 0) {
                captureEmit(cursorZ.cursor(n), ['any', 'update', 'add', 'delete', 'remove'], function() {
                    badCalls++;
                });
            }

            // subtree observe
            expectedCalls += captureEmit(cursorZ.cursor('foo'), ['any', 'remove', 'delete'], function(newValue, oldValue, path) {
                expect(newValue).to.equal(void 0);
                expect(oldValue).to.equal('foo');
                expect(path).to.equal(void 0);
                calls++;
            });
            captureEmit(cursorZ.cursor('foo'), ['add', 'update'], function() {
                badCalls++;
            });

            cursorZ.delete();
            expect(calls).to.equal(expectedCalls);
            expect(badCalls).to.equal(0);
        }));
    });
});

/* helpers */
function captureEmit(cursor, events, fn) {
    let subscriptions = 0;



    for(const event of events) {

        const fnWrap = function(...args) {
            fn.call(null, event, args);
        }

        expect(cursor.on(event, fnWrap)).to.be.a('function');
        subscriptions++;

        if(event == 'any') {
            expect(cursor.observe(fnWrap)).to.be.a('function');
            subscriptions++;
        }
    }
    return subscriptions;
}

function thinfatListeners(num, testcase) {
    const [thin, fat] = num;

    return function() {
        it('sufficiently less listeners', () => {
            testcase(thin);
        });

        it('sufficiently many listeners', () => {
            testcase(fat);
        });
    }
}

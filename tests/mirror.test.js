'use strict';

require('../src/mirror.js');

const { TestEnvironment } = require('jest-environment-jsdom');

test('can create Mirror object', () => {
    const m = new Mirror();
    expect(m).toBeTruthy();
});

test('mirror class has property PREDICATES', () => {
    expect(Mirror.PREDICATES).toBeTruthy();
});

test('mirror objects create', () => {
    //
});

// debug mode works
// FUNCTIONS
// addPredicate
//// can add predicate to mirror class list
//// throws error on attempts to add predicate with existing name
//// throws error if given non-function value for predicate
// addObject
//// can add object reference to Mirror instance
//// throws error when given non-string name to cache object under
//// throws error if given non-object for reference
// removeObject
//// can remove object reference from cached references
//// throws error if given non-string name
// viewValue
//// throws error if given non-string name for cached object
//// throws error if given non-string name for object property
// validConstraint
//// returns false with no arguments
//// returns false with invalid argument
//// returns false if given invalid predicate
//// warns if given invalid predicate function
//// returns false if referenced object does not contain indicated property
//// warns if referenced object does not contain indicated property
//// returns true when given valid constraint object
// mirrorInput
//// throws error if given invalid value for inputElement 
//// throws error if inputElement does not have data-obj attribute
//// throws error if inputElement does not have data-property attribute
//// throws error if data-obj attribute references non-cached object 
//// throws error if data-property references non-existing property of cached object
//// a DOM checkbox can update a properpty with boolean value
//// a DOM text input can update a properpty with string value
//// a DOM text number input can update a properpty with number value

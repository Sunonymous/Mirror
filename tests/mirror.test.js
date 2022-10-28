/**
 * @jest-environment jsdom
 */

const M = require('../src/mirror.js');

const { TestEnvironment } = require('jest-environment-jsdom');

// object creation
test('can create Mirror object', () => {
    const m = new M.Mirror();
    expect(m).toBeTruthy();
});

test('mirror class has property PREDICATES', () => {
    expect(M.Mirror.PREDICATES).toBeTruthy();
});

test('class property PREDICATES contains only functions for values', () => {
    const predicates = Object.values(M.Mirror.PREDICATES);
    expect(predicates.every((v) => typeof v === 'function')).toBe(true);
});

test('mirror objects have an objects property and a debug property', () => {
    const m = new M.Mirror();
    expect(Object.keys(m)).toContain('objects');
    expect(Object.keys(m)).toContain('debug');
});

/////////////
// FUNCTIONS

// addPredicate
test('can add predicate to mirror class list', () => {
    const m = new M.Mirror();
    m.addPredicate('test', (a, b) => true);
    expect(Object.keys(M.Mirror.PREDICATES)).toContain('test');
});

test('throws error on attempts to add predicate with existing name', () => {
    expect(() => m.addPredicate('less', (a, b) => true)).toThrow();
});

test('throws error if given non-function value for predicate', () => {
    expect(() => m.addPredicate('test', 42)).toThrow();
    expect(() => m.addPredicate('test', true)).toThrow();
    expect(() => m.addPredicate('test', '42')).toThrow();
    expect(() => m.addPredicate('test', null)).toThrow();
    expect(() => m.addPredicate('test', {apples: 'yum'})).toThrow();
    expect(() => m.addPredicate('test')).toThrow();
});

// addObject
test('can add object reference to Mirror instance', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    m.addObject('test', obj);
    expect(Object.keys(m.objects)).toContain('test');
    expect(m.objects.test).toBe(obj);
});

test('throws error when given non-string name to cache object under', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    expect(() => m.addObject(null, obj)).toThrow();
    expect(() => m.addObject(undefined, obj)).toThrow();
    expect(() => m.addObject(true, obj)).toThrow();
    expect(() => m.addObject(42, obj)).toThrow();
    expect(() => m.addObject(() => 'secret', obj)).toThrow();
    expect(() => m.addObject(obj, obj)).toThrow();
});

test('throws error if given non-object for reference', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    expect(() => m.addObject('test', null)).toThrow();
    expect(() => m.addObject('test', undefined)).toThrow();
    expect(() => m.addObject('test', true)).toThrow();
    expect(() => m.addObject('test', 42)).toThrow();
    expect(() => m.addObject('test', '42')).toThrow();
    expect(() => m.addObject('test', () => 42)).toThrow();
});

// removeObject
test('can remove object reference from cached references', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    m.addObject('test', obj);
    m.removeObject('test');
    expect(Object.keys(m.objects)).not.toContain('test');
});

test('returns false if given non-matching string name cached object', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    expect(m.removeObject('squirrel')).toBe(false);
});

test('returns false if given non-string name', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    expect(m.removeObject(undefined)).toBe(false);
    expect(m.removeObject(null)).toBe(false);
    expect(m.removeObject(42)).toBe(false);
    expect(m.removeObject(true)).toBe(false);
    expect(m.removeObject(() => 42)).toBe(false);
    expect(m.removeObject({definitely: 'should not work'})).toBe(false);
});

// viewValue
test('returns value at property of cached object', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    m.addObject('test', obj);
    expect(m.viewValue('test', 'secret')).toBe('juicy');
});

test('throws error if given non-string name for cached object', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    m.addObject('test', obj);
    expect(() => m.viewValue(undefined, 'secret')).toThrow();
    expect(() => m.viewValue(null, 'secret')).toThrow();
    expect(() => m.viewValue(42, 'secret')).toThrow();
    expect(() => m.viewValue(true, 'secret')).toThrow();
    expect(() => m.viewValue(() => 'test', 'secret')).toThrow();
});

test('throws error if given non-string name for object property', () => {
    const m = new M.Mirror();
    const obj = {secret: 'juicy'};
    m.addObject('test', obj);
    expect(() => m.viewValue('test', undefined)).toThrow();
    expect(() => m.viewValue('test', null)).toThrow();
    expect(() => m.viewValue('test', 42)).toThrow();
    expect(() => m.viewValue('test', true)).toThrow();
    expect(() => m.viewValue('test', () => 'test')).toThrow();
});

// validConstraint
test('returns false with no arguments', () => {
    expect(M.Mirror.validConstraint()).toBe(false);
});

test('returns false with invalid argument', () => {
    expect(M.Mirror.validConstraint(undefined)).toBe(false);
    expect(M.Mirror.validConstraint(null)).toBe(false);
    expect(M.Mirror.validConstraint(42)).toBe(false);
    expect(M.Mirror.validConstraint('42')).toBe(false);
    expect(M.Mirror.validConstraint(true)).toBe(false);
    expect(M.Mirror.validConstraint(false)).toBe(false);
    expect(M.Mirror.validConstraint(() => {far: 'out'})).toBe(false);
});

test('returns false if given invalid predicate', () => {
    const m = new M.Mirror();
    const obj = {coolFactor: 333};
    m.addObject('test', obj);
    const invalidPredicate = {
        predicate: 'cooler',
        property: 'coolFactor',
    };
    expect(M.Mirror.validConstraint.call(obj, invalidPredicate)).toBe(false);
});

test('returns false if referenced object does not contain indicated property', () => {
    const m = new M.Mirror();
    const obj = {coolFactor: 333};
    m.addObject('test', obj);
    const invalidProperty = {
        predicate: 'less',
        property: 'coolFactorial',
    };
    expect(M.Mirror.validConstraint.call(obj, invalidProperty)).toBe(false);
});

test('returns true when given valid constraint object', () => {
    const m = new M.Mirror();
    const obj = {coolFactor: 333};
    m.addObject('test', obj);
    const constraint = {
        predicate: 'less',
        property: 'coolFactor',
        fallback: 42,
    };
    expect(M.Mirror.validConstraint.call(obj, constraint)).toBe(true);
});

// mirrorInput
test('throws error if given invalid value for inputElement ', () => {
    const div = document.createElement('div'); // DOM element of incorrect type
    const m = new M.Mirror();
    expect(() => m.mirrorInput()).toThrow();
    expect(() => m.mirrorInput(null)).toThrow();
    expect(() => m.mirrorInput(42)).toThrow();
    expect(() => m.mirrorInput('42')).toThrow();
    expect(() => m.mirrorInput(true)).toThrow();
    expect(() => m.mirrorInput(() => div)).toThrow();
    expect(() => m.mirrorInput(div)).toThrow();
});

test('throws error if inputElement does not have data-obj attribute', () => {
    const input = document.createElement('input');
    const obj = {secret: 'juicy'};
    const m = new M.Mirror();
    m.addObject('test', obj);
    input.setAttribute('data-property', 'secret');
    expect(() => m.mirrorInput(input)).toThrow();
});

test('throws error if inputElement does not have data-property attribute', () => {
    const input = document.createElement('input');
    input.setAttribute('data-obj', 'test');
    const obj = {secret: 'juicy'};
    const m = new M.Mirror();
    m.addObject('test', obj);
    expect(() => m.mirrorInput(input)).toThrow();
});

test('throws error if data-obj attribute references non-cached object ', () => {
    const input = document.createElement('input');
    input.setAttribute('data-obj', 'test');
    input.setAttribute('data-property', 'secret');
    const m = new M.Mirror();
    expect(() => m.mirrorInput(input)).toThrow();
});

test('throws error if data-property references non-existing property of cached object', () => {
    const input = document.createElement('input');
    input.setAttribute('data-obj', 'test');
    input.setAttribute('data-property', 'sauce');
    const m = new M.Mirror();
    expect(() => m.mirrorInput(input)).toThrow();
});

test('a DOM checkbox can update a properpty with boolean value', () => {
    const obj = {blissful: true};
    const input = document.createElement('input');
    const event = new CustomEvent('change');
    input.type = 'checkbox';
    input.checked = true;
    input.setAttribute('data-obj', 'test');
    input.setAttribute('data-property', 'blissful');
    const m = new M.Mirror();
    m.addObject('test', obj);
    m.mirrorInput(input);
    input.checked = false;
    input.dispatchEvent(event);
    expect(obj.blissful).toBe(false);
    input.checked = true;
    input.dispatchEvent(event);
    expect(obj.blissful).toBe(true);
});

test('a DOM text input can update a property with string value', () => {
    const obj = {secret: 'juicy'};
    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('data-obj', 'test');
    input.setAttribute('data-property', 'secret');
    const m = new M.Mirror();
    m.addObject('test', obj);
    m.mirrorInput(input);
    input.value = 'sauce';
    const event = new CustomEvent('change');
    input.dispatchEvent(event);
    expect(obj.secret).toBe('sauce');
});

test('a DOM text number input can update a property with number value', () => {
    const obj = {answer: 42};
    const input = document.createElement('input');
    input.type = 'number';
    input.setAttribute('data-obj', 'test');
    input.setAttribute('data-property', 'answer');
    const m = new M.Mirror();
    m.addObject('test', obj);
    m.mirrorInput(input);
    input.value = -999;
    const event = new CustomEvent('change');
    input.dispatchEvent(event);
    expect(obj.answer).toBe(-999);
    input.value = 1000000000;
    input.dispatchEvent(event);
    expect(obj.answer).toBe(1000000000);
});

/////////////
// DEBUG

test('debug mode is activated by passing a truthy argument to the constructor', () => {
    expect(new M.Mirror(true).debug).toBe(true);
    expect(new M.Mirror(42).debug).toBe(true);
    expect(new M.Mirror('42').debug).toBe(true);
    expect(new M.Mirror(() => 'anything').debug).toBe(true);
});
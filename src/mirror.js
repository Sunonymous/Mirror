// Right now the constraints can only reference the current/same object.
// A system was attempted to allow cross-object constraints, though there were
//   issues with passing the execution context. Could explore the issue later if need arises.

class Mirror {
    static PREDICATES = {
        less:           (a, b) => a < b,
        lessOrEqual:    (a, b) => a <= b,
        equal:          (a, b) => a = b,
        greater:        (a, b) => a > b,
        greaterOrEqual: (a, b) => a > b,
    }

    // pass the constructor any truthy value or object to get debug mode.
    // what an interface...
    constructor(debugMode) {
        this.objects = {}; // tools cache references to particular objects
        this.debug = !!debugMode;
    }

    // Adds a predicate function to the list of comparison functions used to compare values
    //   as constraints. Must be given a unique name, and the compareFunction must accept two values.
    addPredicate(name, compareFunction) {
        if (Object.keys(Mirror.PREDICATES).includes(name)) throw 'Must provide a unique name for predicate function.';
        if (!compareFunction || typeof compareFunction !== 'function') throw 'Must provide a function to be used as a predicate.';

        Mirror.PREDICATES[name] = compareFunction;
        return true;
    }

    addObject(name, objRef) {
        if (!name || typeof name !== 'string') throw 'Must provide string name to cache object reference.';
        if (!objRef || typeof objRef !== 'object') throw 'Must provide valid object to reference.';

        this.objects[name] = objRef;
        return true; // why not?
    }

    removeObject(name) {
        if (Object.keys(this.objects).includes(name)) {
            this.objects[name] = undefined;
            return true;
        } else {
            console.warn(`Tried to remove non-cached object '${name}' from Mirror.`);
            return false;
        }
    }

    // Use this function to access the current value of a property in a cached object.
    viewValue(objName, property) {
        if (!objName || typeof objName !== 'string')     throw 'Must provide string name of cached object.';
        if (!property || typeof property !== 'string')   throw 'Must provide valid string property name to view.';
        return this.objects[objName][property];
    }

    // Given an input element in the DOM (which must contain a data-obj attribute containing
    //   the name of the cached object, and a data-property attribute containing the string
    //   name of the property to mirror), and an constraint object formatted as such:
    //
    /*   { predicate: 'lower' || 'lessOrEqual' || 'equal' || 'greater' || 'greaterOrEqual',
           property: 'propertyName' || 'objName.propertyName',
           fallback: value || () => 1 + 1 } */
    //
    // The comparison property references some arrow functions saved into the Mirror object to
    //   compare the two values.
    mirrorInput(inputElement, constraint) {
        // Validate first argument.
        if (!inputElement)                    throw 'Must provide valid DOM Element to attach to.';
        if (inputElement.tagName !== 'INPUT') throw 'inputElement must be an HTML Input Element';
        // Validate that the object contains the required data attributes.
        ['obj', 'property'].forEach((dataAttr) => {
            if (!inputElement.dataset[dataAttr]) throw `inputElement does not contain required attribute ${dataAttr}'`;
        });

        // Validate connection.
        const   object = inputElement.dataset.obj;
        const property = inputElement.dataset.property;
        if (!Object.keys(this.objects).includes(object))  throw `Object ${object} is not cached in Mirror.`;
        const currentValue = this.objects[object][property];
        if (currentValue === undefined) throw `Cached object ${object} does not contain property ${property}.`;
        const type = typeof currentValue;
        
        // Attach event
        inputElement.addEventListener('change', (e) => {
            // Check for constraint object.
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            const objectRef = this.objects[object];
            if (Mirror.validConstraint.call(objectRef, constraint)) {
                const compareValue = objectRef[constraint.property];
                const passedCheck = Mirror.PREDICATES[constraint.predicate].call(objectRef, value, compareValue);
                if (passedCheck) {
                    if (this.debug) console.info(`Setting ${property} of ${object} to ${value}`);
                    this.objects[object][property] = Mirror.castValue(type, value);
                } else { // if constraint check failed
                    if (constraint.fallback) {
                        const fallback = constraint.fallback;
                        const defaultedValue = typeof fallback === 'function' ? fallback.call(objectRef) : fallback;
                        this.objects[object][property] = Mirror.castValue(type, defaultedValue);
                        e.target.value = defaultedValue;
                    } else { // fallback value not present; no action taken
                        console.warn(`Mirror attempted to reflect value to ${object}.${property}. Its constraint failed and no fallback value is present.`);
                    }
                }
            } else {
                if (this.debug) console.info(`Setting ${property} of ${object} to ${value}`);
                this.objects[object][property] = Mirror.castValue(type, value);
            }
        });
    }

    static castValue(type, value) {
        const functions = {
            string: String,
            number: Number,
            boolean: (x) => !!x, // does this work?
        };
        return functions[type](value);
    }

    static validConstraint(constraintObj) {
        if (!constraintObj) return false;

        // Validate presence of predicate
        const predicate = constraintObj.predicate;
        if (!Object.keys(Mirror.PREDICATES).includes(predicate)) {
            console.warn(`Invalid predicate ${predicate} requested in constraint.`);
            return false;
        }

        // Validate presence of property.
        const object = this;
        const property = constraintObj.property;

        const currentValue = object[property];
        if (currentValue === undefined) {
            console.warn(`Object '${object}' does not contain property ${property}`);
            return false;
        }

        return true; // all systems go!
    }
}

module.exports = {
    Mirror,
}
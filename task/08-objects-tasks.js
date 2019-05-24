'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
	this.height = height;
}

Rectangle.prototype.getArea = function() {
    return this.width * this.height;
};


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
const errors = {
    countOccur: 'Element, id and pseudo-element should not occur more then one time inside the selector',
    incorrectSequence: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
};
const constant = {
    combine: '',
    idPrefix: '#',
    classPrefix: '.',
    attrPrefix: '[',
    attrPostfix: ']',
    pseudoClassPrefix: ':',
    pseudoElementPrefix: '::',
};
const selectorSequence = {
    empty: -1,
    element: 0,
    id: 1,
    class: 2,
    attr: 3,
    pseudoClass: 4,
    pseudoElement: 5,
}

class BaseNode {
    stringify() {
        throw new Error('Not implemented');
    }
}

class ElementNode extends BaseNode {
    constructor() {
        super()
        this._id = '';
        this._element = '';
        this._classes = new Map();
        this._attrs = new Map();
        this._pseudoClasses = new Map();
        this._pseudoElement = '';
        this._lastOperation = selectorSequence.empty;
    }

    element(value) {
        if (this._element) throw Error(errors.countOccur);

        this.lastOperation = selectorSequence.element;
        this._element = value;

        return this;
    }

    id(value) {
        if (this._id) throw Error(errors.countOccur);

        this.lastOperation = selectorSequence.id;
        const prefix = constant.idPrefix;
        this._id = prefix + value;

        return this;
    }

    class(value) {
        this.lastOperation = selectorSequence.class;
        const prefix = constant.classPrefix;
        this._classes.set(value, prefix + value);

        return this;
    }

    attr(value) {
        this.lastOperation = selectorSequence.attr;
        const prefix = constant.attrPrefix;
        const postfix = constant.attrPostfix;
        this._attrs.set(value, prefix + value + postfix);

        return this;
    }

    pseudoClass(value) {
        this.lastOperation = selectorSequence.pseudoClass;
        const prefix = constant.pseudoClassPrefix;
        this._pseudoClasses.set(value, prefix + value);

        return this;
    }

    pseudoElement(value) {
        if (this._pseudoElement) throw Error(errors.countOccur);

        this.lastOperation = selectorSequence.pseudoElement;
        const prefix = constant.pseudoElementPrefix;
        this._pseudoElement = prefix + value;

        return this;
    }

    stringify() {
        const id = this._id;
        const element = this._element;
        const classes = Array.from(this._classes.values()).join('') || '';
        const attrs = Array.from(this._attrs.values()).join('') || '';
        const pseudoClasses = Array.from(this._pseudoClasses.values()).join('') || '';
        const pseudoElement = this._pseudoElement;

        return element + id + classes + attrs + pseudoClasses + pseudoElement;
    }

    set lastOperation(operation) {
        if (this._lastOperation > operation) throw Error(errors.incorrectSequence);

        this._lastOperation = operation;
    }
}

class CombineNode extends BaseNode {
    constructor(selector1, combinator, selector2) {
        super()

        this._left = selector1;
        this._combinator = combinator;
        this._right = selector2;
    }


    stringify() {
        const left = this._left.stringify();
        const combinator = this._combinator;
        const right = this._right.stringify();

        return `${left} ${combinator} ${right}`;
    }
}

const cssSelectorBuilder = {

    element: function(value) {
        const node = this.checkNode(this);

        node.element(value);

        return node;
    },

    id: function(value) {
        const node = this.checkNode(this);

        node.id(value);

        return node;
    },

    class: function(value) {
        const node = this.checkNode(this);

        node.class(value);

        return node;
    },

    attr: function(value) {
        const node = this.checkNode(this);

        node.attr(value);

        return node;
    },

    pseudoClass: function(value) {
        const node = this.checkNode(this);

        node.pseudoClass(value);

        return node;
    },

    pseudoElement: function(value) {
        const node = this.checkNode(this);

        node.pseudoElement(value);

        return node;
    },

    combine: function(selector1, combinator, selector2) {
        return new CombineNode(selector1, combinator, selector2);
    },

    checkNode: function(obj) {
        return (obj instanceof BaseNode) ? obj : new ElementNode();
    }
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};

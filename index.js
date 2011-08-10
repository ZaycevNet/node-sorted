var sorted = module.exports = function (xs, cmp) {
    if (typeof xs === 'function') {
        cmp = arguments[0];
        xs = arguments[1];
    }
    
    if (!xs) xs = [];
    var isSorted = false;
    
    for (var i = 1; i < xs.length; i++) {
        if (xs[i-1] > xs[i]) isSorted = false;
    }
    
    return sorted.fromSorted(
        isSorted ? xs.slice() : xs.slice().sort()
    );
};

sorted.fromSorted = function (xs, cmp) {
    return new Sorted(xs, cmp);
};

var Sorted = exports.Sorted = function (xs, cmp) {
    this.elements = xs;
    this.length = xs.length;
    
    this.compare = cmp || function (a, b) {
        if (a == b) return 0
        else if (a > b) return 1
        else if (a < b) return -1
        else throw new RangeError('Unstable comparison: ' + a + ' cmp ' + b)
    };
};

Sorted.prototype.push = Sorted.prototype.unshift = function (x) {
    if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
            this.push(arguments[i]);
        }
    }
    else {
        var i = this.findIndex(x);
        this.elements.splice(i, 0, x);
    }
    
    this.length = this.elements.length;
    return this.elements.length;
};

Sorted.prototype.splice = function (ix, len) {
    var res = this.elements.splice(ix, len);
    
    for (var i = 2; i < arguments.length; i++) {
        this.push(arguments[i]);
    }
    
    this.length = this.elements.length;
    return res;
};

Sorted.prototype.findIndex = function (x, start, end) {
    var elems = this.elements;
    if (start === undefined) start = 0;
    if (end === undefined) end = elems.length;
    
    for (var i = start, j = end; ;) {
        var k = Math.floor((i + j) / 2);
        if (k === elems.length) break;
        if (i === j) break;
        
        var cmp = this.compare(x, elems[k]);
        if (cmp === 0) break;
        else if (cmp < 0) j = k;
        else if (cmp > 0) i = k + 1;
        else throw new RangeError(
            'Unstable comparison result for compare('
            + x + ', ' + elems[k] + ') : ' + cmp + ')'
        );
    }
    
    return k;
};

Sorted.prototype.indexOf = function (x) {
    var i = this.findIndex(x);
    return this.elements[i] === x ? i : -1;
};

Sorted.prototype.inspect = function () {
    return '<Sorted [' + this.elements.join(',') + ']>'
};

Sorted.prototype.toArray = function () {
    return this.elements.slice()
};

Sorted.prototype.sort = function (cmp) {
    if (!cmp || this.compare === cmp) {
        return this.slice();
    }
    else {
        return sorted(this.elements, cmp);
    }
};

Sorted.prototype.concat = function () {
    var xs = this.slice();
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (Array.isArray(arg)) {
            xs.push.apply(xs, arg);
        }
        else if (arg instanceof Sorted) {
            xs.insert(arg);
        }
        else {
            xs.push(arg);
        }
    }
    return xs;
};

Sorted.prototype.insert = function (xs) {
    if (!(xs instanceof Sorted)) {
        xs = sorted(Array.isArray(xs) ? xs : [ xs ]);
    }
    
    var x = xs.get(0);
    var y = xs.get(xs.length - 1);
    
    var start = this.findIndex(x);
    var end = this.findIndex(y) + 1;
    
    for (var i = 0; i < xs.length; i++) {
        var x = xs.get(i);
        var ix = this.findIndex(x, start, end);
        this.elements.splice(ix, 0, x);
        end ++;
    }
    
    this.length = this.elements.length;
    
    return this;
};

Sorted.prototype.get = function (i) {
    return this.elements[i];
};

Sorted.prototype.set = function (i, x) {
    this.elements.splice(i, 1);
    this.push(x);
    return this;
};

Sorted.prototype.slice = function () {
    return sorted.fromSorted(
        this.elements.slice.apply(this.elements, arguments),
        this.compare
    );
};

Sorted.prototype.map = function () {
    return sorted(
        this.elements.map.apply(this.elements, arguments),
        this.compare
    );
};

Sorted.prototype.filter = function () {
    return sorted(
        this.elements.filter.apply(this.elements, arguments),
        this.compare
    );
};

[ 'forEach', 'reduce', 'reduceRight', 'every', 'some', 'join' ]
    .forEach(function (name) {
        Sorted.prototype[name] = function () {
            return this.elements[name].apply(this.elements, arguments);
        };
    })
;

Sorted.prototype.shift = function () {
    var x = this.elements.shift();
    this.length = this.elements.length;
    return x;
};

Sorted.prototype.pop = function () {
    var x = this.elements.pop();
    this.length = this.elements.length;
    return x;
};

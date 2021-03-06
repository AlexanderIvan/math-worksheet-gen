"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("./Expression");
const Numeric_1 = require("./Numeric");
const mathjs = require("mathjs");
const Giac_1 = require("./Giac");
class Polynomial extends Expression_1.Expression {
    /**
     * The allowed string must be of the form
     * (x^4 + 4*x^3 - 6*x^2 + 4*x + 1)
     * parenthesis and * are optional
     * @param str Parses the string into a Polynomial object
     */
    static parse(str) {
        let symbols = 0;
        const coefs = [];
        let tree;
        if (typeof (str) === 'string') {
            tree = mathjs.parse(str);
        }
        else {
            tree = str;
        }
        tree.forEach((child, path, parent) => {
            console.log(child, path, parent);
        });
        return new Polynomial(coefs);
    }
    // Constructs the polynomial given all complex roots
    static fromRoots(roots) {
        if (roots.length === 0) {
            console.log("! Polynomial.fromRoots(roots): roots is an empty array. Is this an error?");
            return new Polynomial([1]);
        }
        const binomials = roots.map((e) => {
            if (typeof (e) === "number") {
                e = Numeric_1.Numeric.fromNumber(e);
            }
            let coef1 = 1;
            let coef2 = e.oposite();
            if (coef2.Re["d"] > 1) {
                coef1 = coef2.Re["d"];
                coef2 = coef2.multiply(Numeric_1.Numeric.fromNumber(coef1));
            }
            return new Polynomial([coef1, coef2]);
        });
        let poly = binomials[0];
        for (var i = 1; i < binomials.length; i++) {
            poly = poly.multiply(binomials[i]);
        }
        poly.roots = roots;
        return poly;
    }
    constructor(coefs) {
        super();
        this.coefs = (coefs || []).map((e) => {
            if (e instanceof Numeric_1.Numeric) {
                return e;
            }
            else if (typeof (e) === "string") {
                const frac = mathjs.fraction(e);
                return new Numeric_1.Numeric(frac["n"], frac["d"]);
            }
            else if (typeof (e) === "number") {
                return new Numeric_1.Numeric(e);
            }
        });
        //Must cleanup coefficients in order to remove trailing zeros otherwise
        //degree would be wrong
        while (this.coefs.length > 1 && this.coefs[0].isZero()) {
            this.coefs.splice(0, 1);
        }
    }
    degree() {
        return this.coefs.length - 1;
    }
    /**
     * Converts a monomial c x^dg to a polinomial object
     * @param {type} c
     * @param {type} dg
     * @returns {rgen-algebra_L1.Poly}
     */
    static monomial(coef, degree) {
        var result = new Array(degree + 1);
        result[0] = coef;
        for (var i = 1; i < degree + 1; i++) {
            result[i] = Numeric_1.Numeric.fromNumber(0);
        }
        return new Polynomial(result);
    }
    ;
    multiply(p2) {
        let c2 = p2.coefs;
        const productdg = this.coefs.length + c2.length - 2;
        const product = new Array(productdg + 1);
        for (let i = 0; i < product.length; i++) {
            product[i] = Numeric_1.Numeric.fromNumber(0);
        }
        for (let i = 0; i < c2.length; i++) {
            for (let k = 0; k < this.coefs.length; k++) {
                product[i + k] = product[i + k].add(this.coefs[k].multiply(c2[i]));
            }
        }
        ;
        return new Polynomial(product);
    }
    add(p2) {
        let c2 = p2.coefs;
        const l1 = this.coefs.length;
        const l2 = c2.length;
        const result = new Array(Math.max(l1, l2));
        for (let i = 0; i < result.length; i++) {
            const v1 = l1 - i - 1 >= 0 ? this.coefs[l1 - i - 1] : Numeric_1.Numeric.fromNumber(0);
            const v2 = l2 - i - 1 >= 0 ? c2[l2 - i - 1] : Numeric_1.Numeric.fromNumber(0);
            result[result.length - i - 1] = v1.add(v2);
        }
        return new Polynomial(result);
    }
    substract(p2) {
        const p2minus = new Polynomial(p2.coefs.map(e => e.oposite()));
        return this.add(p2minus);
    }
    divide(p2) {
        const c2 = p2.coefs;
        const l1 = this.coefs.length;
        const l2 = c2.length;
        if (l1 < l2) {
            return { quotient: new Polynomial([0]), remainder: this };
        }
        else {
            let quo = new Polynomial([0]);
            let remainder = this;
            while (remainder.degree() >= p2.degree()) {
                const step = Polynomial._divide(remainder, p2);
                quo = quo.add(step.q);
                remainder = step.r;
            }
            ;
            return { quotient: quo, remainder: remainder };
        }
    }
    /**
     * One step division
     * @param {type} p1
     * @param {type} c2
     * @param {type} indx
     * @returns {Poly._divide.productAnonym$2}
     */
    static _divide(p1, p2) {
        const q = p1.coefs[0].divide(p2.coefs[0]);
        const n = p1.degree() - p2.degree();
        const quocient = Polynomial.monomial(q, n);
        const remainder = p1.substract(p2.multiply(quocient));
        return { q: quocient, r: remainder };
    }
    power(n) {
        if (n === 0) {
            return new Polynomial([1]);
        }
        else if (n === 1) {
            return this;
        }
        else {
            let pow = this;
            for (let i = 1; i < n; i++) {
                pow = pow.multiply(this);
            }
            return pow;
        }
    }
    derive() {
        if (this.degree() <= 0) {
            return new Polynomial([0]);
        }
        const deriv = new Array(this.coefs.length - 1);
        for (let i = 0; i < this.coefs.length - 1; i++) {
            const n = this.coefs.length - i;
            deriv[i] = this.coefs[i].multiply(Numeric_1.Numeric.fromNumber(n));
        }
        return new Polynomial(deriv);
    }
    integrate(cte) {
        if (!cte) {
            cte = 0;
        }
        const integral = new Array(this.coefs.length + 1);
        for (let i = 0; i < this.coefs.length; i++) {
            const n = this.coefs.length - i;
            integral[i] = this.coefs[i].multiply(new Numeric_1.Numeric(1, n + 1));
        }
        integral[integral.length - 1] = cte;
        return new Polynomial(integral);
    }
    toString(bar = "x") {
        const degree = this.degree();
        const withPowers = this.coefs.map((coef, i) => {
            const expd = degree - i;
            if (!coef.isZero()) {
                let num = "" + coef.toTeX();
                if (coef.isOne() && i !== degree) {
                    num = "1";
                }
                if (!coef.isNegative() && i > 0) {
                    num = "+ " + num;
                }
                let literal = (expd ? (bar + (expd === 1 ? "" : "^(" + expd + ")")) : "");
                if (literal) {
                    literal = "" + literal;
                }
                return (num ? (num + (literal ? "*" : "")) : "") + literal;
            }
            else {
                return "";
            }
        });
        let result = withPowers.join(" ");
        if (!result.trim()) {
            result = "0";
        }
        return result;
    }
    toTeX(bar = "x") {
        const degree = this.degree();
        const withPowers = this.coefs.map((coef, i) => {
            const expd = degree - i;
            if (!coef.isZero()) {
                let num = "" + coef.toTeX();
                if (coef.isOne() && i !== degree) {
                    num = "";
                }
                const negative = coef.isNegative();
                if (num === "-1" && i < degree) {
                    num = "-";
                }
                if (!negative && i > 0) {
                    num = "+ " + num;
                }
                let literal = (expd ? (bar + (expd === 1 ? "" : "^{" + expd + "}")) : "");
                if (literal) {
                    literal = " " + literal;
                }
                return num + literal;
            }
            else {
                return "";
            }
        });
        let result = withPowers.join(" ");
        if (!result.trim()) {
            result = "0";
        }
        return result;
    }
    toFactorForm(bar = "x") {
        if (this.roots) {
            // Sort roots by multiplicity
            const multiRoots = {};
            this.roots.forEach((root) => {
                let coef1 = 1;
                let coef2 = root.oposite();
                if (coef2.Re["d"] > 1) {
                    coef1 = coef2.Re["d"];
                    coef2 = coef2.multiply(Numeric_1.Numeric.fromNumber(coef1));
                }
                const id = root.toString();
                let obj = multiRoots[id];
                if (!obj) {
                    multiRoots[id] = { coef1: coef1, coef2: coef2, multiplicity: 1 };
                }
                else {
                    obj.multiplicity += 1;
                }
            });
            return Object.keys(multiRoots).map((key) => {
                const e = multiRoots[key];
                let exponent = "";
                if (e.multiplicity > 1) {
                    exponent = "^{" + e.multiplicity + "}";
                }
                let str1 = "";
                if (e.coef1 !== 1) {
                    str1 = e.coef1.toString();
                }
                let str2 = e.coef2.toTeX();
                if (e.coef2.isZero()) {
                    return str1 + " x " + exponent;
                }
                else {
                    if (!e.coef2.isNegative()) {
                        str2 = " + " + str2;
                    }
                    return "\\left(" + str1 + " x " + str2 + "\\right)" + exponent;
                }
            }).join(" \\cdot ");
        }
        else {
            // Fallback to giac
            return Giac_1.Giac.factor(this.toString(bar), true);
        }
    }
}
exports.Polynomial = Polynomial;
//# sourceMappingURL=Polynomial.js.map
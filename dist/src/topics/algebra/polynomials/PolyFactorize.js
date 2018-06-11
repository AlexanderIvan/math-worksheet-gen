"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const Random_1 = require("../../../util/Random");
const WsGenerator_1 = require("../../../util/WsGenerator");
const Numeric_1 = require("../../../math/Numeric");
const Polynomial_1 = require("../../../math/Polynomial");
let PolyFactorize = class PolyFactorize {
    constructor(qGenOpts) {
        this.qGenOpts = qGenOpts;
        const rnd = qGenOpts.rand || new Random_1.Random();
        const r = qGenOpts.question.interval || 7;
        const complexity = qGenOpts.question.complexity || 1;
        const minDegree = qGenOpts.question.minDegree || 2;
        const maxDegree = qGenOpts.question.maxDegree || 4;
        const numRoots = rnd.intBetween(minDegree, maxDegree);
        const roots = rnd.intList(numRoots, r).map((e) => Numeric_1.Numeric.fromNumber(e));
        if (qGenOpts.question.allowFractions) {
            // At most two rational roots are allowed
            const numFrac = rnd.intBetween(1, 2);
            for (let i = 0; i < numFrac; i++) {
                roots[i] = rnd.fractionBetweenNotZero(-r, r);
            }
        }
        const poly = Polynomial_1.Polynomial.fromRoots(roots);
        this.question = poly.toTeX();
        this.answer = poly.toFactorForm();
    }
    getFormulation() {
        return "$" + this.question + " = {}$";
    }
    getAnswer() {
        return "$" + this.answer + "$ ";
    }
    getDistractors() {
        return [];
    }
};
PolyFactorize = __decorate([
    WsGenerator_1.WsGenerator({
        category: "algebra/polynomial/factorize",
        parameters: [
            {
                name: "interval",
                defaults: 10,
                description: "Range in which random coefficients are generated"
            },
            {
                name: "minDegree",
                defaults: 2,
                description: "Minimal degree of the generated polynomial"
            },
            {
                name: "maxDegree",
                defaults: 10,
                description: "Maximum degree of the generated polynomial"
            },
            {
                name: "allowFractions",
                defaults: false,
                description: "Allow rational roots, so factor is of the form (ax+b)"
            },
            {
                name: "complexity",
                defaults: 1,
                description: "Complexity. From 0-1. with 1 includes irreductible polynomials"
            }
        ]
    }),
    __metadata("design:paramtypes", [Object])
], PolyFactorize);
exports.PolyFactorize = PolyFactorize;
//# sourceMappingURL=PolyFactorize.js.map
import { WsActivity } from "./WsActivity";
import { SectionOptsInterface } from "../interfaces/SectionOptsInterface";
import { Vector } from "../math/Vector";
import { GenClass } from "../interfaces/GenClass";
import { Polynomial } from "../math/Polynomial";
import { PolyMonomial } from "../math/PolyMonomial";
import { AlgebraicFraction } from "../math/AlgebraicFraction";
import { Numeric } from "../math/Numeric";
import * as vm from 'vm';

export class WsSection {

    activities: WsActivity[] = [];

    constructor(public title: string, private opts: SectionOptsInterface) {
    }

    createActivity(formulation: string, scope?: any, qClass?: GenClass, qGenOpts?: any) {   
        // Eval scope in a context     
        if (scope && Object.keys(scope).length) {            
            try {
                const context: any = {rnd: this.opts.rand, Vector: Vector, Polynomial: Polynomial,
                    PolyMonomial: PolyMonomial, Numeric: Numeric, AlgebraicFraction: AlgebraicFraction, Math: Math};
                vm.createContext(context);

                // Must evaluate this scope into objects
                for (let key in scope) {
                    vm.runInContext(key + "=" + scope[key], context);
                    scope[key] = context[key];
                }

                // Finally eval formulation into the given scope
                vm.runInContext("_formulation = \`" + formulation + "\`", context);
                formulation = context["_formulation"];
            } catch(Ex) {
                console.log(Ex);
            }
        } 
        
        const activity = new WsActivity(formulation, {scope: scope, ...this.opts}, qClass, qGenOpts);
        this.activities.push(activity);
        return activity;
    }

    toLaTeX(): string[] {
        const latex = [];
        latex.push("  \\section{" + this.title + "}");
        latex.push("     \\begin{enumerate}[resume]");
        this.activities.forEach( (activity) => {
            latex.push(...activity.toLaTeX());
        })
        latex.push("     \\end{enumerate}");
        latex.push(" ");
        return latex;
    }

    answersToLaTeX(): string[] {
        const latex = [];
        this.activities.forEach( (activity) => {
            latex.push(...activity.answersToLaTeX());
        })
        return latex;
    }

    toHtml(activityCounter: number): string[] {
        const latex = []; 
        latex.push('<ol class="olsection">')
        latex.push('  <li><h3 style="display: inline-block;"><b>' + this.title + "</b></h3></li>");
        latex.push('  <ol start="' + activityCounter + '">');
        this.activities.forEach( (activity) => {
            latex.push(...activity.toHtml());
        })
        latex.push("  </ol>"); 
        latex.push("</ol><hr/>"); 
        return latex;
    }

    answersToHtml(activityCounter: number): string[] {
        const latex = [];
        latex.push('<ol start="' + activityCounter + '">');
        this.activities.forEach( (activity) => {           
            latex.push(...activity.answersToHtml());            
        });
        latex.push("</ol>");
        return latex;
    }
}
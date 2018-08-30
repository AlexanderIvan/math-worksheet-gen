import { AbstractDocumentTree, ActivityTree } from "../interfaces/AbstractDocumentTree";
import * as MarkdownIt from "markdown-it";
import { i18n } from "./wsExporter";
import {toRoman} from 'roman-numerals';
import * as attrs from "markdown-it-attrs";

const md = new MarkdownIt();
md.use(attrs);

export function wsExporterHtml (adt: AbstractDocumentTree, opts: any): string {

const PREAMBLE = `
<!DOCTYPE html>
<html>
<head>
<title>${adt.title || 'wsMath' }</title>
<meta charset="utf-8">
<meta author="${adt.author}">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.9.0/dist/katex.min.css" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/katex@0.9.0/dist/katex.min.js" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0/contrib/auto-render.min.js" integrity="sha384-IiI65aU9ZYub2MY9zhtKd1H2ps7xxf+eb2YFG9lX6uRqpXCvBTOidPRCXCrQ++Uc" crossorigin="anonymous"></script>
<script type="text/javascript" charset="UTF-8" src="//cdnjs.cloudflare.com/ajax/libs/jsxgraph/0.99.3/jsxgraphcore.js"></script>
<style>
.olalpha {
    counter-reset: alphacounter;
    margin: 10px; 
    font-size: 110%;
}
.olalpha > li {
    list-style: none;
    position: relative;
    margin-bottom: 15px;
}
.olalpha > li:before {
    margin-left: -10px;
    counter-increment: alphacounter;
    content: counter(alphacounter, lower-alpha) ") ";
    position: absolute;
    left: -1.4em; 
}
.arial {
    font-family: Arial, Helvetica, sans-serif;
}
.activity-formulation {
    font-size: 120%;
}
.instructions {                
    border: 2px solid blue;
    border-radius: 5px;
    background-color: rgb(220,250,255);
    width: 90%;
    padding: 10px;
    font-size: 110%;
}
@media print {               
    .instructions {
        font-size: 12px;
    }
    p {
        font-size: 90%;
    }
    h2 {
        font-size: 90%;
    } 
    h3 {
        font-size: 90%;
    }  
    h4 {
        font-size: 90%;
    } 
    @page {
        margin: 1.5cm 1cm;
    }
    .activity-formulation {
        font-size: 12px;
    }
    .arial-large {
        font-size: 16px;
    }
    .question-formulation {
        font-size: 12px;
    }
 }
</style>
</head>
<body>
`;

const builder = ["<!-- Generated by wsMath on " + new Date() + " (c) J. Mulet (2018)-->", PREAMBLE];

if (adt.title) {
    builder.push("<h2 class=\"arial arial-large\" style=\"color:blue;text-align:center;\"><b>" + adt.title + "</b></h2>")
}
if (adt.instructions) {
    builder.push('<div class=\"instructions\"><p>' + markdownToHtml(adt.instructions) + "</p></div>")
}

builder.push(`<p class=\"arial\"> <b>${i18n('REFERENCE', opts.lang)}</b>   ${adt.sid}  /  ${adt.seed} . <b>${i18n('NAME', opts.lang)}:</b>  
    ${adt.fullname ? adt.fullname : '..........................................................'} </p>`);


let activityCounter = 1;
if (adt.activities) {
    builder.push('<ol start="' + activityCounter + '">');
    adt.activities.forEach((activity) => {
        builder.push(...renderActivity(activity, opts));
        activityCounter += 1;
        builder.push("<br/>")
    });
    builder.push("</ol>");
}

if (adt.sections) {
    adt.sections.forEach((section, sectionIndx) => {
        builder.push(" <br/><h3>" + toRoman(sectionIndx+1) + ". " + section.title + "</h3>");
        builder.push('<ol start="' + activityCounter + '">');
        section.activities.forEach( (activity) => {
            builder.push(...renderActivity(activity, opts));
            builder.push("<br/>")
            if (activity.questions.length) {
                activityCounter += 1; 
            }
        });
        builder.push("<br/></br>")
        builder.push("  </ol>\n");            
    }); 
}

if (opts.includeKeys !== 0 && !opts.keysPlacement) {
    builder.push(`  <hr/><h3><b>${i18n('ANSWERS', opts.lang)}</b></h3>`);
    builder.push("  <ol>");
    if (adt.activities) {
        adt.activities.forEach( activity => {
            // Skip activities without questions (aka theory boxes)
            if (activity.questions.length) {
                builder.push(...renderActivityAnswer(activity, opts));
            }            
        });
    }
    if (adt.sections) {
        adt.sections.forEach((section) => {
            section.activities.forEach(activity => {
                // Skip activities without questions (aka theory boxes)
                if (activity.questions.length) {
                    builder.push(...renderActivityAnswer(activity, opts));
                }
            });     
            builder.push("<br/>");
        });
    }        
    builder.push("  </ol>");
} 




function renderActivityAnswer(activity: ActivityTree, opts: any): string[] {
    const html = [];
    if (!opts.keysPlacement) {
        html.push("    <li> ");
    }
    const nquestions = activity.questions.length;
    let startLi = "";
    let endLi = "";
    if (nquestions > 1) {
        html.push('    <ol class="olalpha">');
        startLi = "     <li> ";
        endLi = "</li>";
    }
    // Skip activity with no questions
    activity.questions.forEach((question, i) => {
        if (Math.abs(opts.includeKeys)===1) {
            if (i === 0 ) {
                if (opts.includeKeys === -1) {
                    html.push(startLi + (markdownToHtml(question.steps || question.answer) || i18n("NO_ANSWER", opts.lang))  + endLi);
                } else {
                    html.push(startLi +  (markdownToHtml(question.answer) || i18n("NO_ANSWER", opts.lang)) + endLi);
                }
            }
        } else {
            if (opts.includeKeys===-2) {
                html.push(startLi +  (markdownToHtml(question.steps || question.answer) || i18n("NO_ANSWER", opts.lang) )+ endLi);
            } else {
                html.push(startLi +  (markdownToHtml(question.answer) || i18n("NO_ANSWER", opts.lang)) + endLi);
            }
        }
    });
    if (nquestions > 1) {
        html.push("    </ol>");
    }

    return html;
}

 

 builder.push(`
<script>
 var options = {delimiters: [
     {left: "$$", right: "$$", display: true}, 
     {left: "$", right: "$", display: false}, 
     {left: "\\\\[", right: "\\\\]", display: true}, 
     {left: "\\\\(", right: "\\\\)", display: false} 
 ]};
 document.addEventListener("DOMContentLoaded", function() {
   renderMathInElement(document.body, options);
 });
</script>
 </body>
 </html>`);
 return filterHtml(builder.join("\n"));

}

 
    
    
    
function renderActivity(activity: ActivityTree, opts: any): string[] {
    const html = [];

    activity.formulation = markdownToHtml(activity.formulation);

    //Check it this activity contains no questions
    if (activity.questions.length === 0) {
        // Assume that this is not a question and it is displayed as theory block
        html.push('<div style="background:rgb(200,200,255); box-shadow: 5px 5px grey; webkit-box-shadow: 5px 5px grey; moz-box-shadow: 5px 5px grey; border-radius: 5px; width:95%; border:1px solid blue; padding:5px"><p class="activity-formulation">' +
             activity.formulation + "</p></div>");
    } else if (activity.questions.length === 1) {
        const q = activity.questions[0];
        html.push('    <li> <div class="activity-formulation">' + activity.formulation + ' ' +
             markdownToHtml(q.formulation) + '</div></li>');
    } else {
        html.push('    <li> <div class="activity-formulation">' + activity.formulation + "</div></li>");
        html.push('    <ol class="olalpha">');
        
        activity.questions.forEach((question, indx) => {
            let sampleAnswer = "";
            const formulation = markdownToHtml(question.formulation);
            const answer = markdownToHtml(question.answer);
            const steps = markdownToHtml(question.steps);            

            if (opts.includeKeys === 1 && answer && indx === 0 && opts.keysPlacement === 2) {
                sampleAnswer = "  $\\quad \\rightarrow \\quad$ " + answer; 
            }
            try {
                html.push('      <li> <div class="question-formulation">' + formulation + '<div style="color:red">' + sampleAnswer + "</div></div></li>");
            } catch (Ex) {
                console.log('EXCEPTION:: Skipping question:: ', Ex);
                const ind = this.questions.indexOf(question);
                this.questions.splice(ind, 1);
            }
        });
        html.push("    </ol>");

        //TODO: write answers below activity placement=2 or detailed answer required
    }

    return html;
    }
    
    
    function markdownToHtml(str: string): string {
        if (!str) {
            return str;
        } 
        //The file text parser inline sets \ as end char so it removes it from text token
        str = str.replace(/\\\\/gm, "\\\\\\ ").replace(/\\,/gm, "\\\\,").replace(/\\;/gm, "\\\\;").replace(/\\{/gm, "\\\\{");
        const html = md.render(str, {});
        return html;
    }
    
    function filterHtml(src: string): string {
    
        return src;
    }
    
    
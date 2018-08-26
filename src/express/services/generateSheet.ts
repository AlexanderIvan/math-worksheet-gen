 
import { WsMathGenerator, WsExportFormats } from "../../worksheet/WsMathGenerator";
import { latexToPdf } from "../../util/latexToPdf"; 
import { Stream } from "stream";

/**
 * A workbook is the definition of rules which will generate many Sheets
 */

export interface SheetStruct {
    uid: string;
    sheet: string | Buffer;
    sheetWithkeys: string | Buffer;
    workbook: any;
}

const LATEX_FORMATS = ["tex", "latex", "pdf"];

export async function generateSheet(uid: string, workbook: any): Promise<SheetStruct> {
    let sheetInstance: SheetStruct = {uid: uid, workbook: workbook, sheet: "", sheetWithkeys: ""};
    const generator = new WsMathGenerator(workbook);
    generator.create(workbook);

    if (workbook.type === 'moodlexml') {
        sheetInstance.sheet = generator.exportAs(uid, WsExportFormats.MOODLEXML); 
    } else if ( LATEX_FORMATS.indexOf(workbook.type) >= 0) {
        let raw = generator.exportAs(uid, WsExportFormats.LATEX); 
        let rawKeys = generator.exportAs(uid, WsExportFormats.LATEX, true); 
        raw = raw.replace(/’/g, "'").replace(/€/g, "\\euro{} ");
        rawKeys = rawKeys.replace(/’/g, "'").replace(/€/g, "\\euro{} ");
        sheetInstance.sheet = raw;
        sheetInstance.sheetWithkeys = rawKeys;

        if (workbook.type === "pdf") {
            try {
                sheetInstance.sheet = await latexToPdf(sheetInstance.sheet);
                sheetInstance.sheetWithkeys = await latexToPdf(sheetInstance.sheetWithkeys);
            } catch(Ex) {
                console.log(Ex);
            }
        }
    } else {
        // by default use html output
        sheetInstance.sheet = generator.exportAs(uid, WsExportFormats.HTML); 
        sheetInstance.sheetWithkeys = generator.exportAs(uid, WsExportFormats.HTML, true); 
    }     
    return sheetInstance;
}
export class ToolbarHelper {
    public static createSelector(options: Array<{ value: string, text: string }>, isSelected: (option: { value: string, text: string }) => boolean, hander: (e: any) => void) {
        const selectWrapper = document.createElement("div");
        selectWrapper.className = "sva-question__select-wrapper";
        const select = document.createElement("select");
        select.className = "sva-question__select";
        options.forEach(option => {
            let optionElement = document.createElement("option");
            optionElement.value = option.value;
            optionElement.text = option.text;
            optionElement.selected = isSelected(option);
            select.appendChild(optionElement);
        });
        select.onchange = hander;
        selectWrapper.appendChild(select);
        return selectWrapper;
    }
    public static createButton(handler: (e: any) => void, text = "", cssClass = "") {
        const button = document.createElement("span");
        button.className = "sva-toolbar__button " + cssClass;
        button.innerText = text;
        button.onclick = handler;
        return button;
    }
}

export var options = {
    runningInBrowser: typeof window.URL.createObjectURL === "function"
}
export function allowDomRendering() {
    return options.runningInBrowser;
}

export class DataHelper {
    public static zipArrays(first: any[], second: any[]): any[][] {
        let zipArray: any[] = [];
        for (let i = 0; i < Math.min(first.length, second.length); i++) {
            zipArray[i] = [first[i], second[i]];
        }
        return zipArray;
    }

    public static unzipArrays(zipArray: any[][]): { first: any[]; second: any[] } {
        let twoArrays: any = { first: [], second: [] };
        zipArray.forEach((value, i) => {
            twoArrays.first[i] = value[0];
            twoArrays.second[i] = value[1];
        });
        return twoArrays;
    }

    public static sortDictionary(
        keys: any[],
        values: any[],
        desc: boolean
    ): { keys: any[]; values: any[] } {
        let dictionary = this.zipArrays(keys, values);
        let comparator = (a: any[], b: any[], asc: boolean = true) => {
            let result = a[1] < b[1] ? 1 : a[1] == b[1] ? 0 : -1;
            return asc ? result : result * -1;
        };
        dictionary.sort((a: any[], b: any[]) => {
            return desc ? comparator(a, b, false) : comparator(a, b);
        });
        let keysAndValues = this.unzipArrays(dictionary);
        return { keys: keysAndValues.first, values: keysAndValues.second };
    }
}

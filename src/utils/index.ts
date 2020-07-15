export class ToolbarHelper {
  public static createSelector(
    options: Array<{ value: string; text: string }>,
    isSelected: (option: { value: string; text: string }) => boolean,
    hander: (e: any) => void
  ) {
    const selectWrapper = document.createElement("div");
    selectWrapper.className = "sva-question__select-wrapper";
    const select = document.createElement("select");
    select.className = "sva-question__select";
    options.forEach((option) => {
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
  public static createButton(
    hander: (e: any) => void,
    text = "",
    cssClass = ""
  ) {
    const button = document.createElement("span");
    button.className = "sva-toolbar__button " + cssClass;
    button.innerText = text;
    button.onclick = hander;
    return button;
  }
}

export class DocumentHelper {
  public static createSvgElement(path: string): SVGSVGElement {
    const svgElem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    const useElem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "use"
    );
    useElem.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      "#sa-svg-" + path
    );
    svgElem.appendChild(useElem);
    return svgElem;
  }

  public static createSvgButton(path: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "sa-table__svg-button";
    btn.appendChild(DocumentHelper.createSvgElement(path));
    return btn;
  }

  public static createBtn(caption: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "sa-table__btn sa-table__btn--small sa-table__btn--gray";
    btn.innerHTML = caption;
    return btn;
  }

  public static createInput(
    className: string,
    placeholder = "",
    defaultValue = ""
  ): HTMLInputElement {
    var el = document.createElement("input");
    el.className = className;
    el.placeholder = placeholder;
    el.defaultValue = defaultValue;
    return el;
  }
}

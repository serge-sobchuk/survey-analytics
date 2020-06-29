import { Table } from "./table";
import { SurveyModel, HtmlConditionItem } from "survey-core";
import { ColumnVisibility, QuestionLocation } from "./config";
import { localization } from "../localizationManager";

import "./tabulator.scss";
import { ActionsHelper } from "../utils";

const TabulatorTables = require("tabulator-tables");

if (!!document) {
  const svgTemplate = require("html-loader?interpolate!val-loader!../svgbundle.html");
  const templateHolder = document.createElement("div");
  templateHolder.style.display = "none";
  templateHolder.innerHTML = svgTemplate;
  document.head.appendChild(templateHolder);
}

export class Tabulator extends Table {
  constructor(
    targetNode: HTMLElement,
    survey: SurveyModel,
    data: Array<Object>,
    options: any,
    _columns: Array<any> = [],
    isTrustedAccess = false
  ) {
    super(targetNode, survey, data, options, _columns, isTrustedAccess);
    const self = this;
    targetNode.className += "sa-tabulator";
    if (_columns.length === 0) {
      self._columns = self.buildColumns(survey);
    }
  }

  private tabulatorTables: any = null;
  private toolsContainer: HTMLElement = null;
  private tableContainer: HTMLElement = null;

  public render = () => {
    const columns = this.getColumns();
    const data = this.tableData;

    this.toolsContainer = document.createElement("div");
    this.tableContainer = document.createElement("div");

    this.targetNode.innerHTML = "";
    this.targetNode.appendChild(this.toolsContainer);
    this.targetNode.appendChild(this.tableContainer);

    this.tabulatorTables = new TabulatorTables(this.tableContainer, {
      data,
      layout: "fitData",
      pagination: "local",
      paginationSize: 5,
      movableColumns: true,
      columns,
      height: "100%",
      rowFormatter: this.toggleDetails,
    });

    this.renderTools();
  };

  renderTools = () => {
    const toolsContainer = this.toolsContainer;
    const showColumnDropdown = this.getShowColumnDropdown();
    toolsContainer.innerHTML = "";
    if (!!showColumnDropdown) toolsContainer.appendChild(showColumnDropdown);
  };

  getShowColumnDropdown = (): HTMLElement => {
    const dropdown = document.createElement("select");
    dropdown.classList.add("sa-tabulator__show-column");

    var hiddenColumns = this.columns.filter(
      (column) => column.visibility === ColumnVisibility.Invisible
    );
    if (hiddenColumns.length == 0) return null;
    var option = document.createElement("option");
    option.text = localization.getString("showColumn");
    option.disabled = true;
    option.selected = true;
    dropdown.appendChild(option);

    hiddenColumns.forEach((column) => {
      var option = document.createElement("option");
      var text = column.displayName;
      if (text.length > 20) {
        text = text.substring(0, 20) + "...";
      }
      option.text = text;
      option.title = column.displayName;
      option.value = column.name;
      dropdown.appendChild(option);
    });

    var self = this;
    dropdown.onchange = function (e: any) {
      const val = e.target.value;
      e.stopPropagation();
      if (!val) return;

      var column = self._columns.filter((column) => column.name === val)[0];
      column.visibility = ColumnVisibility.Visible;
      self.tabulatorTables.toggleColumn(column.name);
      self.update();
    };

    return dropdown;
  };

  public destroy = () => {
    this.tabulatorTables.destroy();
    this.targetNode.innerHTML = "";
  };

  public update() {
    this.renderTools();
  }

  toggleDetails = (row: any): void => {
    row.getCells()[0].getElement().appendChild(this.getDetailsBtn(row));
  };
  getDetailsBtn = (row: any) => {
    const button = ActionsHelper.createSvgButton("detail");
    button.title = localization.getString("showMinorColumns");
    var self = this;
    var hidden = document.createElement("div");
    hidden.innerHTML = "<p>hidden info</p>";
    hidden.style.display = "none";
    row.getElement().appendChild(hidden);
    button.onclick = function () {
      if (hidden.style.display === "none") {
        hidden.style.display = "block";
      } else {
        hidden.style.display = "none";
      }

      row.normalizeHeight(); //recalculate the row height
    };
    return button;
  };

  protected getTitleFormatter = (
    cell: any,
    formatterParams: any,
    onRendered: any,
    columnName: any
  ) => {
    var container = document.createElement("div");
    var title = this.getColumnTitle(cell.getValue());
    var actions = this.getActions(columnName);
    container.appendChild(actions);
    container.appendChild(title);
    return container;
  };

  getColumnTitle = (titleStr: string): HTMLElement => {
    var title = document.createElement("span");
    title.innerHTML = titleStr;
    return title;
  };
  //actions for columns
  getActions = (columnName: string): HTMLDivElement => {
    var container = document.createElement("div");
    container.classList.add("sa-tabulator__action-container");
    container.appendChild(this.getDragBtn());
    container.appendChild(this.getSortBtn());
    container.appendChild(this.getMoveToDetailsBtn(columnName));
    container.appendChild(this.getHideBtn(columnName));
    return container;
  };

  getDragBtn(): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "sa-tabulator__svg-button sa-tabulator__drag-button";
    btn.appendChild(ActionsHelper.createSvgElement("drag"));
    btn.onclick = (e) => {
      e.stopPropagation();
    };
    return btn;
  }

  getSortBtn(): HTMLButtonElement {
    const descTitle = localization.getString("descOrder");
    const ascTitle = localization.getString("ascOrder");
    var btn = ActionsHelper.createSvgButton("sorting");
    btn.onclick = (e) => {
      btn.title = btn.title == ascTitle ? descTitle : ascTitle;
    };
    btn.ondrag = (e) => {
      e.stopPropagation;
    };
    return btn;
  }

  getHideBtn(columnName: string): HTMLButtonElement {
    var btn = ActionsHelper.createSvgButton("hide");
    btn.onclick = () => {
      this._columns.filter(
        (column) => column.name === columnName
      )[0].visibility = ColumnVisibility.Invisible;
      this.tabulatorTables.toggleColumn(columnName);
      this.update();
    };
    return btn;
  }

  getMoveToDetailsBtn(columnName: string): HTMLButtonElement {
    const button = ActionsHelper.createSvgButton("movetodetails");
    button.title = localization.getString("moveToDetail");
    button.onclick = (e) => {
      e.stopPropagation();
      this._columns.filter((column) => column.name === columnName)[0].location =
        QuestionLocation.Row;
      this.tabulatorTables.toggleColumn(columnName);
      this.update();
    };
    return button;
  }

  protected getColumns = () => {
    const availableColumns = this.getAvailableColumns();
    const columns: any = availableColumns.map((column, index) => {
      var question = this.survey.getQuestionByName(column.name);
      return {
        field: column.name,
        title: (question && question.title) || column.displayName,
        visible: column.visibility !== ColumnVisibility.Invisible,
        headerFilter: true,
        titleFormatter: (cell: any, formatterParams: any, onRendered: any) => {
          return this.getTitleFormatter(
            cell,
            formatterParams,
            onRendered,
            column.name
          );
        },
      };
    });

    // add special column (collapse/expand)
    columns.unshift({
      field: "",
      title: "",
    });

    return columns;
  };
}

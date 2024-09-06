import io, { Socket } from "socket.io-client";

export type VarType = "string" | "number" | "boolean";

export type Value = {
  type: VarType;
  value: DataTypeValue<Value["type"]>;
};

type DataTypeValue<T extends VarType> = T extends "boolean"
  ? boolean
  : T extends "number"
  ? number
  : T extends "string"
  ? string
  : never;

export type ValueResponse = Value | null;

export type Values = { [key: string]: ValueResponse };
export type VarTuple = [string, ValueResponse];

export type Config = {
  live: boolean;
  vars: string[];
  mode: "html" | "explicit";
  onChange?: (VarTuple: VarTuple) => void;
};

export default class HotVar {
  private static API_URL = import.meta.env.PROD
    ? "https://api.hotvar.com"
    : "http://localhost:5000";

  private vars: string[] = [];
  private values: Values = {};
  private config: Config = {
    live: false,
    vars: [],
    mode: "html",
  };
  private socket: Socket | null = null;

  constructor(options: Partial<Config> = {}) {
    this.config = {
      ...this.config,
      ...options,
    };
    this.vars = [...this.config.vars];

    if (this.config.mode === "html") {
      this.initHTMLMode();
    } else {
      this.initExplicitMode();
    }
    if (this.config.live) {
      this.initSocket();
    }
  }

  private initExplicitMode() {
    this.fetchVars();
  }

  private initHTMLMode() {
    const els = document.querySelectorAll("[data-hotvar]");
    for (const el of els) {
      const varName = el.getAttribute("data-hotvar");
      const placeholder = el.getAttribute("data-hotvar-placeholder");
      el.innerHTML = placeholder ?? el.innerHTML;

      if (varName) {
        this.vars.push(varName);
      }
    }
    this.fetchVars();
  }

  private fetchVars() {
    HotVar.fetchMany(this.vars).then((res) => {
      Object.keys(res).forEach((name) => {
        this.propagateVariable([name, res[name]]);
      });
      this.commitValues(res);
    });
  }

  private initSocket() {
    this.socket = io(HotVar.API_URL);
    this.vars.forEach((varName) => {
      if (!this.socket) return;
      // `update` will never be null
      this.socket.on(varName, (update: Value) => {
        this.propagateVariable([varName, update]);
        this.commitValues({ [varName]: update });
      });
    });
  }

  destroy() {
    this.socket && this.socket.close();
  }

  static async fetchMany(varNames: string[]) {
    const varNamesString = varNames.join(";");
    return (await (
      await fetch(`${this.API_URL}/var/${varNamesString}`)
    ).json()) as Values;
  }

  static async fetchOne(varName: string) {
    return (await (await fetch(`${this.API_URL}/var/${varName}`)).json())[
      varName
    ] as ValueResponse;
  }

  private propagateVariable(varTuple: VarTuple) {
    this.config.onChange && this.config.onChange(varTuple);
  }

  private commitValues(values: Values) {
    this.values = { ...this.values, ...values };
    if (this.config.mode === "html") {
      Object.keys(this.values).forEach((name) => {
        this.findAndUpdate([name, this.values[name]]);
      });
    }
  }

  private findAndUpdate([varName, value]: VarTuple) {
    if (!value) return;

    const el = document.querySelector(`[data-hotvar='${varName}']`);

    if (el) {
      if (value.type === "string" || value.type === "number") {
        el.innerHTML = value.value.toString();
      }
    }
  }
}

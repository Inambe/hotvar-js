import io from "socket.io-client";

type VarType = "string" | "number" | "boolean";

type ValueType = {
  type: VarType;
  value: DataTypeValue<ValueType["type"]>;
};

type DataTypeValue<T extends VarType> = T extends "boolean"
  ? boolean
  : T extends "number"
  ? number
  : T extends "string"
  ? string
  : never;

type Values = { [key: string]: ValueType | null };

export default class HotVar {
  private API_URL = import.meta.env.PROD
    ? "https://api.hotvar.com"
    : "http://localhost:5000";

  private vars: string[] = [];
  private values: Values = {};
  private config: {
    live: boolean;
    ignoreEmpty: boolean;
  } = {
    live: true,
    ignoreEmpty: true,
  };

  constructor(options: Partial<typeof this.config> = {}) {
    this.config = {
      ...this.config,
      ...options,
    };

    this.init();
    this.fetchVars();
    if (this.config.live) {
      this.initSocket();
    }
  }

  init() {
    const els = document.querySelectorAll("[data-hotvar]");
    for (const el of els) {
      const varName = el.getAttribute("data-hotvar");
      const placeholder = el.getAttribute("data-hotvar-placeholder");
      el.innerHTML = placeholder ?? el.innerHTML;

      if (varName) {
        this.vars.push(varName);
      }
    }
  }

  fetchVars() {
    const fetchVars = this.vars.join(":");
    fetch(`${this.API_URL}/var/${fetchVars}`)
      .then((res) => res.json())
      .then((res: Values) => {
        this.commitValues(res);
      });
  }

  initSocket() {
    const socket = io(this.API_URL);
    this.vars.forEach((varName) => {
      socket.on(varName, (update: ValueType) => {
        this.commitValues({ [varName]: update });
      });
    });
  }

  commitValues(values: Values) {
    this.values = { ...this.values, ...values };
    Object.keys(this.values).forEach((name) => {
      this.findAndUpdate(name, this.values[name]);
    });
  }

  findAndUpdate(varName: string, value: ValueType | null) {
    if (!value) return;

    const el = document.querySelector(`[data-hotvar='${varName}']`);

    if (el) {
      if (value.type === "string" || value.type === "number") {
        el.innerHTML = value.value.toString();
      }
    }
  }
}

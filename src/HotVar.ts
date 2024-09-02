import io from "socket.io-client";

export default class HotVar {
  API_URL = "https://api.hotvar.com";

  vars: string[] = [];
  values: { [key: string]: string | null } = {};
  config: {
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
      .then((res) => {
        Object.keys(res).forEach((name) => {
          this.values[name] = res[name];
        });
        this.commitValues();
      });
  }

  initSocket() {
    const socket = io(this.API_URL);
    this.vars.forEach((name) => {
      socket.on(name, (update) => {
        this.values[name] = update;
        this.commitValues(name);
      });
    });
  }

  commitValues(name?: string) {
    if (name) {
      this.findAndUpdate(name, this.values[name]);
    } else {
      Object.keys(this.values).forEach((name) => {
        this.findAndUpdate(name, this.values[name]);
      });
    }
  }

  findAndUpdate(varName: string, value: string | null) {
    if (!value && this.config.ignoreEmpty) return;

    const el = document.querySelector(`[data-hotvar='${varName}']`);
    if (el) {
      el.innerHTML = value ?? "";
    }
  }
}

export type VarType = "string" | "number" | "boolean";
export type ValueType = {
    type: VarType;
    value: DataTypeValue<ValueType["type"]>;
};
type DataTypeValue<T extends VarType> = T extends "boolean" ? boolean : T extends "number" ? number : T extends "string" ? string : never;
export type ValueResponse = ValueType | null;
export type Values = {
    [key: string]: ValueResponse;
};
export type VarTuple = [string, ValueResponse];
export type Config = {
    live: boolean;
    ignoreEmpty: boolean;
    vars: string[];
    mode: "html" | "explicit";
    onChange?: (VarTuple: VarTuple) => void;
};
export default class HotVar {
    private API_URL;
    private vars;
    private values;
    private config;
    private socket;
    constructor(options?: Partial<Config>);
    private initExplicitMode;
    private initHTMLMode;
    private fetchVars;
    private initSocket;
    destroy(): void;
    private propagateVariable;
    private commitValues;
    private findAndUpdate;
}
export {};

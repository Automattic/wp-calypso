// flow-typed signature: 406db5a4b593f1a7d6ca8bf5bdf49059
// flow-typed version: 94e9f7e0a4/fuse.js_v2.x.x/flow_>=v0.28.x

declare module 'fuse.js' {
  declare type FuseOptions = {
    keys?: Array<any>,
    id?: string,
    caseSensitive?: bool,
    include?: Array<any>,
    shouldSort?: bool,
    searchFn?: Function,
    getFn?: (obj: any, path: string) => any,
    sortFn?: Function,
  }
  declare class Fuse<T> {
    static (items: Array<T>, options?: FuseOptions): Fuse<T>;
    search(pattern: string): Array<T>;
    set<U: Array<T>>(list: U): U;
  }
  declare module.exports: typeof Fuse;
}

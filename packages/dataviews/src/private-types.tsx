export type SelectionOrUpdater = string[] | ( ( prev: string[] ) => string[] );
export type SetSelection = ( selection: SelectionOrUpdater ) => void;

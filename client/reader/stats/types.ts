export interface ReaderPost {
	feed_ID: number;
	feed_item_ID: number;
	ID: number;
	is_external?: boolean;
	is_jetpack?: boolean;
	railcar?: ReaderRailcar;
	site_ID: number;
}

export type ReaderRailcar = Partial< Record< string, string | number | boolean | null > >;

export type ReaderEventProperties = Record< string, string | number | boolean | null | undefined >;

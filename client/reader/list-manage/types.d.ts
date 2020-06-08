export type ItemType = {
	id: string;
	feed_ID: number | null;
	tag_ID: number | null;
	site_ID: number | null;
	[ propName: string ]: string | number | null;
};

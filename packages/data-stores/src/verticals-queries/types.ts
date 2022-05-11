export interface VerticalImage {
	ID: string;
	guid: string;
	post_tile: string;
	post_excerpt: string;
	post_description: string;
	width: number;
	height: number;
	size: string;
	filename: string;
	extension: string;
	meta: Record< string, unknown >;
}

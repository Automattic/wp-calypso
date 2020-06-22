export interface Post {
	id: number;
	slug: string;
	status: string;
	title: { raw: string; rendered: string };
}

export interface Post {
	id: number;
	status: string;
	title: { raw: string; rendered: string };
}

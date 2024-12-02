interface Tag {
	name: string;
}

export interface TaggedSite {
	id: number;
	blog_id: number;
	created_at: number;
	url: string;
	state: string;
	tags: Tag[];
}

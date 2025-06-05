export type SupportContextData = {
	link: string;
	post_id: number;
	blog_id?: number;
};

export type SupportContext = Record< string, SupportContextData >;

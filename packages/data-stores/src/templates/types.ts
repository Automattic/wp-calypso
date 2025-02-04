export type Template = {
	author: number;
	content: {
		block_version: number;
		raw: string;
	};
	description: string;
	has_theme_file: boolean;
	id: string;
	/** Whether the template is custom or not. Custom template is able to be assigned to a page */
	is_custom: boolean;
	slug: string;
	/** Whether the template is from. If the value is custom, then it's created by the user */
	source: 'theme' | 'custom';
	status: 'publish';
	theme: string;
	title: {
		raw: string;
		rendered: string;
	};
	type: 'wp_template' | 'wp_template_part';
	wp_id: number;
};

export type RequestTemplate = Partial< Omit< Template, 'title' | 'content' > > & {
	title?: string;
	content?: string;
};

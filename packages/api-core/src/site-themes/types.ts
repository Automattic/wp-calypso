export interface Theme {
	stylesheet: string;
	stylesheet_uri: string;
	template: string;
	template_uri: string;
	author: {
		raw: string;
		rendered: string;
	};
	author_uri: {
		raw: string;
		rendered: string;
	};
	description: {
		raw: string;
		rendered: string;
	};
	is_block_theme: boolean;
	name: {
		raw: string;
		rendered: string;
	};
	requires_php: string;
	requires_wp: string;
	screenshot: string;
	tags: {
		raw: string[];
		rendered: string;
	};
	textdomain: string;
	theme_supports: Record< string, any >;
	theme_uri: {
		raw: string;
		rendered: string;
	};
	version: string;
	status: 'active' | 'inactive'; // This indicates if the theme is currently active
	default_template_types?: Array< {
		slug: string;
		title: string;
		description: string;
	} >;
	default_template_part_areas?: Array< {
		area: string;
		label: string;
		description: string;
		icon: string;
		area_tag: string;
	} >;
}

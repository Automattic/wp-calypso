export function createMockSite( {
	ID = Math.round( Math.random() * 1000 ),
	name,
	URL,
	is_private = false,
	is_coming_soon = false,
	is_deleted = false,
	visible = true,
	options = {
		is_redirect: false,
		unmapped_url: '',
	},
}: {
	ID?: number;
	name?: string;
	URL?: string;
	is_private?: boolean;
	is_coming_soon?: boolean;
	is_deleted?: boolean;
	visible?: boolean;
	options?: {
		is_redirect?: boolean;
		unmapped_url?: string;
	};
} = {} ) {
	const slug = `site${ ID }.io`;

	return {
		name: name ?? `site ${ ID }`,
		URL: URL ?? `https://site${ ID }.io`,
		slug,
		title: name ?? slug,
		is_private,
		is_coming_soon,
		is_deleted,
		visible,
		options,
	};
}

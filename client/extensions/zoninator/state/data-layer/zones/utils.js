/** @format */
export const fromApi = ( { description, name, slug, term_id } ) => ( {
	description,
	id: term_id,
	name,
	slug,
} );

/** @format */
/**
 * External dependencies
 */
import { get, map } from 'lodash';

export default ( importItems, { importerId, sourceAuthor, targetAuthor } ) => {
	const importerItem = get( importItems, importerId, {} );
	const sourceAuthors = get( importerItem, 'customData.sourceAuthors' );

	return {
		...importItems,
		[ importerId ]: {
			...importerItem,
			customData: {
				...importerItem.customData,
				sourceAuthors: map( sourceAuthors, author => ( {
					...author,
					...( sourceAuthor.id === author.id && {
						mappedTo: targetAuthor,
					} ),
				} ) ),
			},
		},
	};
};

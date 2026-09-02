import 'calypso/state/reader/init';

/**
 * @param {Object} state Global state tree
 * @returns {boolean} true if we are fetching site blocks
 */
export default function isFetchingSiteBlocks( state ) {
	const inflightPages = state?.reader?.siteBlocks?.inflightPages ?? {};
	return Object.values( inflightPages ).some( ( inflightPage ) => inflightPage === true );
}

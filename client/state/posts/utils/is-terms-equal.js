/**
 * Returns truthy if local terms object is the same as the API response
 * @param  {Object}  localTermEdits local state of term edits
 * @param  {Object}  savedTerms     term object returned from API POST
 * @returns {boolean}                are there differences in local edits vs saved terms
 */
export function isTermsEqual( localTermEdits, savedTerms ) {
	return Object.entries( localTermEdits ).every( ( [ taxonomy, terms ] ) => {
		const termsArray = Object.values( terms );
		const isHierarchical = typeof termsArray[ 0 ] === 'object' && termsArray[ 0 ] !== null;
		const normalizedEditedTerms = new Set(
			isHierarchical ? termsArray.map( ( term ) => term.ID ) : termsArray
		);
		const normalizedKey = isHierarchical ? 'ID' : 'name';
		const normalizedSavedTerms = new Set(
			Object.values( savedTerms[ taxonomy ] ?? {} ).map( ( value ) => value[ normalizedKey ] )
		);

		if ( normalizedEditedTerms.size !== normalizedSavedTerms.size ) {
			return false;
		}

		for ( const term of normalizedEditedTerms ) {
			if ( ! normalizedSavedTerms.has( term ) ) {
				return false;
			}
		}

		return true;
	} );
}

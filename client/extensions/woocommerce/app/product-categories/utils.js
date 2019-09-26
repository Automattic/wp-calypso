export function getSaveErrorMessage( slug, translate ) {
	switch ( slug ) {
		case 'term_exists':
			return translate(
				'A category with this name already exists. Please choose a new name or select a different parent category.'
			);
		default:
			return translate( 'There was a problem saving your category. Please try again.' );
	}
}

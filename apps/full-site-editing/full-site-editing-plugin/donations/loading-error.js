/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Placeholder } from '@wordpress/components';

const LoadingError = ( { error } ) => {
	return (
		<div className="donations__loading-status">
			<Placeholder
				icon="lock"
				label={ __( 'Donations', 'full-site-editing' ) }
				instructions={ error }
			></Placeholder>
		</div>
	);
};

export default LoadingError;

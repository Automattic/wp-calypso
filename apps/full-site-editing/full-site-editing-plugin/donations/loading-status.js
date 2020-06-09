/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Placeholder, Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */

const LoadingStatus = () => {
	return (
		<div className="donations__loading-status">
			<Placeholder
				icon="lock"
				label={ __( 'Donations', 'full-site-editing' ) }
				instructions={ __( 'Loading data…', 'full-site-editing' ) }
			>
				<Spinner />
			</Placeholder>
		</div>
	);
};

export default LoadingStatus;

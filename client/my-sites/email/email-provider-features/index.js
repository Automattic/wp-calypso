/**
 * External dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

function EmailProviderFeature( { title } ) {
	return (
		<div className="email-provider-features__feature">
			<Gridicon icon="checkmark" size="18" />

			{ preventWidows( title ) }
		</div>
	);
}

EmailProviderFeature.propTypes = {
	title: PropTypes.string.isRequired,
};

function EmailProviderFeatures( { features } ) {
	if ( ! features ) {
		return null;
	}

	return (
		<div className="email-provider-features">
			{ features.map( ( feature, index ) => (
				<EmailProviderFeature key={ index } title={ feature } />
			) ) }
		</div>
	);
}

EmailProviderFeatures.propTypes = {
	features: PropTypes.arrayOf( PropTypes.string ),
};

export default EmailProviderFeatures;

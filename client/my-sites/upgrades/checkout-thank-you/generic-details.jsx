/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import i18n from 'lib/mixins/i18n';

const GenericDetails = ( { selectedSite } ) => {
	return (
		<Button href={ selectedSite.URL } primary>
			{ i18n.translate( 'Go to my site' ) }
		</Button>
	);
};

GenericDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired
};

export default GenericDetails;

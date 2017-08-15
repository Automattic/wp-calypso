/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const NavigationLink = ( { direction, href, translate } ) => {
	const text = ( direction === 'back' ) ? translate( 'Back' ) : translate( 'Skip for now' );

	return (
		<Button compact borderless
			className="wizard__navigation-link"
			href={ href }>
			{ direction === 'back' && <Gridicon icon="arrow-left" size={ 18 } /> }
			{ text }
			{ direction === 'forward' && <Gridicon icon="arrow-right" size={ 18 } /> }
		</Button>
	);
};

NavigationLink.propTypes = {
	direction: PropTypes.oneOf( [ 'back', 'forward' ] ).isRequired,
	href: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( NavigationLink );

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const NavigationLink = ( { direction, onClick, translate } ) => {
	const text = ( direction === 'back' ) ? translate( 'Back' ) : translate( 'Skip for now' );

	return (
		<Button compact borderless
			className="wizard__navigation-link"
			onClick={ onClick }>
			{ direction === 'back' && <Gridicon icon="arrow-left" size={ 18 } /> }
			{ text }
			{ direction === 'forward' && <Gridicon icon="arrow-right" size={ 18 } /> }
		</Button>
	);
};

NavigationLink.propTypes = {
	direction: PropTypes.oneOf( [ 'back', 'forward' ] ).isRequired,
	onClick: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( NavigationLink );

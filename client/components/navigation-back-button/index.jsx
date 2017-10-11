/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const NavigationBackButton = ( { redirectRoute, translate } ) => (
	<Button className="navigation-back-button" borderless compact href={ redirectRoute }>
		<Gridicon icon="arrow-left" />
		<span className="navigation-back-button__label">{ translate( 'Back' ) }</span>
	</Button>
);

NavigationBackButton.propTypes = {
	redirectRoute: PropTypes.string.isRequired,
};

export default localize( NavigationBackButton );

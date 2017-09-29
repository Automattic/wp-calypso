/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import page from 'page';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ReturnPreviousPage = ( { redirectRoute, translate } ) => {
	const handleClick = () => {
		page( redirectRoute );
	};

	return (
		<Button className="return-previous-page" borderless compact onClick={ handleClick }>
			<Gridicon icon="arrow-left" />
			<span className="return-previous-page__label">{ translate( 'Back' ) }</span>
		</Button>
	);
};

ReturnPreviousPage.propTypes = {
	redirectRoute: PropTypes.string.isRequired,
};

export default localize( ReturnPreviousPage );

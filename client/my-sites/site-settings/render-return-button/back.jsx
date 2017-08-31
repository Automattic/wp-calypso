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

const ReturnToPreviousPage = ( { onBackClick, translate } ) => {
	return (
		<Button className="render-return-button__container" borderless compact onClick={ onBackClick }>
			<Gridicon icon="arrow-left" />
			<span className="render-return-button__label">
				{ translate( 'Back' ) }
			</span>
		</Button>
	);
};

ReturnToPreviousPage.propTypes = {
	onBackClick: PropTypes.func.isRequired,
};

export default localize( ReturnToPreviousPage );

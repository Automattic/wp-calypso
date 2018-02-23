/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const BackButton = ( { onClick, translate } ) => {
	return (
		<div className="back-button">
			<Button borderless compact onClick={ onClick }>
				<Gridicon icon="arrow-left" />
				<span className="back-button__label">{ translate( 'Back' ) }</span>
			</Button>
		</div>
	);
};

BackButton.propTypes = {
	onClick: PropTypes.func.isRequired,
};

BackButton.defaultProps = {
	onClick: noop,
};

export default localize( BackButton );

/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';

const ReaderFullPostBack = ( { onBackClick, translate } ) => {
	return (
		<div className="reader-full-post__back-container">
			<Button className="reader-full-post__back" borderless compact onClick={ onBackClick }>
				<Gridicon icon="arrow-left" />
				<span className="reader-full-post__back-label">{ translate( 'Back' ) }</span>
			</Button>
		</div>
	);
};

ReaderFullPostBack.propTypes = {
	onBackClick: PropTypes.func.isRequired,
};

export default localize( ReaderFullPostBack );

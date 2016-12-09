/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';

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
	onBackClick: React.PropTypes.func.isRequired
};

export default localize( ReaderFullPostBack );

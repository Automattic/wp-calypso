/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const HistoryButton = ( { translate, onClick } ) => (
	<div className="editor-ground-control__history">
		<button
			className="editor-ground-control__save button is-link"
			onClick={ onClick }
			tabIndex={ 3 }
		>
			{ translate( 'History' ) }
		</button>
	</div>
);

export default localize( HistoryButton );

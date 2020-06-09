/**
 * External dependencies
 */
import * as React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

function ReaderExportButton( { onClick, translate } ) {
	return (
		<button className="reader-export-button" onClick={ onClick }>
			<Gridicon icon="cloud-download" className="reader-export-button__icon" />
			<span className="reader-export-button__label">{ translate( 'Export' ) }</span>
		</button>
	);
}

export default localize( ReaderExportButton );

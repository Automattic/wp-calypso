/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */

class ReaderExportButton extends React.Component {
	render() {
		return (
			<div className="reader-export-button">
				{ this.props.translate( 'Export' ) }
			</div>
		);
	}
}

export default localize( ReaderExportButton );

/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import get from 'lodash/get';
import debugFactory from 'debug';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { startImport } from 'lib/importer/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import wp from 'lib/wp';
import Button from 'components/button';

const debug = debugFactory( 'calypso:jetpack-importer' );

const importFileToJetpackSite = ( siteId, args ) =>
	wp.undocumented().jetpackFileImport( siteId, { ...args } );

class JetpackFileImporter extends PureComponent {
	fileInput = {};

	setFileInputRef = element => {
		this.fileInput = element;
	};

	onSubmit = async event => {
		event.preventDefault();
		const file = get( this.fileInput, 'files[0]', null );
		if ( ! file ) {
			return;
		}

		const { siteId } = this.props;

		try {
			const result = await importFileToJetpackSite( siteId, {
				file,
				headers: {},
				options: {},
			} );
			debug( { wut: 'jpfileimport', result } );
		} catch ( errorImporting ) {
			debug( { errorImporting } );
		}
	};

	render() {
		const { translate } = this.props;
		return (
			<div>
				{ translate( 'Import from a file (zip, xml)' ) }
				<br />
				<input ref={ this.setFileInputRef } type="file" />
				<Button onClick={ this.onSubmit }>Upload</Button>
			</div>
		);
	}
}

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{ startImport }
)( localize( JetpackFileImporter ) );

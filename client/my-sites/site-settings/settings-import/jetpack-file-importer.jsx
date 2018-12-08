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
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import wp from 'lib/wp';
import Button from 'components/button';

const debug = debugFactory( 'calypso:jetpack-importer' );

const getPluginStatus = async ( siteSlug, pluginName ) => {
	try {
		const wpImporterPluginStatus = await wp
			.undocumented()
			.jetpackPluginStatus( siteSlug, pluginName );

		return wpImporterPluginStatus.active ? 'active' : 'inactive';
	} catch ( errorImporting ) {
		return 'not_installed';
	}
};

const ensurePluginIsInstalled = async ( siteSlug, pluginName, pluginPath ) => {
	const pluginStatus = await getPluginStatus( siteSlug, pluginName );
	switch ( pluginStatus ) {
		case 'active':
			return 'already_active';
		case 'inactive':
			await wp.undocumented().jetpackActivatePlugin( siteSlug, pluginPath );
			return 'activated';
		case 'not_installed':
			await wp.undocumented().jetpackInstallPlugin( siteSlug, pluginName );
			await wp.undocumented().jetpackActivatePlugin( siteSlug, pluginPath );
			return 'installed_and_activated';
		default:
			throw 'Unexpected plugin status: ' + pluginStatus;
	}
};

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

		const { siteId, siteSlug } = this.props;

		try {
			const pluginAction = await ensurePluginIsInstalled(
				siteSlug,
				'wordpress-importer',
				'wordpress-importer%2Fwordpress-importer'
			);

			debug( { pluginAction } );
			const result = await wp.undocumented().jetpackFileImport( siteId, { file } );
			debug( { importSuccess: result } );
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

export default connect( state => ( {
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( JetpackFileImporter ) );

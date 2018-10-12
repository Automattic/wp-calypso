/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */

import { appStates } from 'state/imports/constants';
import Card from 'components/card';
import ImporterHeader from '../importer-header';
import ImportingPane from '../importing-pane';
import SiteImporterInputPane from './site-importer-input-pane';

/**
 * Module variables
 */
const compactStates = [ appStates.DISABLED, appStates.INACTIVE ];
const importingStates = [
	appStates.IMPORT_FAILURE,
	appStates.IMPORT_SUCCESS,
	appStates.IMPORTING,
	appStates.MAP_AUTHORS,
];
const uploadingStates = [
	appStates.READY_FOR_UPLOAD,
	appStates.UPLOAD_FAILURE,
	appStates.UPLOAD_SUCCESS,
	appStates.UPLOAD_PROCESSING,
	appStates.UPLOADING,
];

export default class extends React.PureComponent {
	static displayName = 'SiteImporter';

	static propTypes = {
		importerData: PropTypes.shape( {
			title: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ).isRequired,
			uploadDescription: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		} ).isRequired,
		importerStatus: PropTypes.shape( {
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			filename: PropTypes.string,
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		const { title, icon, description, uploadDescription } = this.props.importerData;
		const site = this.props.site;
		const state = this.props.importerStatus;
		const isEnabled = appStates.DISABLED !== state.importerState;
		const cardClasses = classNames( 'importer__shell', {
			'is-compact': includes( compactStates, state.importerState ),
			'is-disabled': ! isEnabled,
		} );

		return (
			<Card className={ cardClasses }>
				<ImporterHeader
					importerStatus={ state }
					{ ...{ icon, title, description, isEnabled, site } }
				/>
				{ includes( importingStates, state.importerState ) && (
					<ImportingPane importerStatus={ state } site={ this.props.site } />
				) }
				{ includes( uploadingStates, state.importerState ) && (
					<SiteImporterInputPane
						{ ...this.props }
						description={ uploadDescription }
						importerStatus={ state }
						onStartImport={ this.validateSite }
					/>
				) }
			</Card>
		);
	}
}

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import { appStates } from 'calypso/state/imports/constants';
import { Card } from '@automattic/components';
import ImporterHeader from '../importer-header';
import ImportingPane from '../importing-pane';
import SiteImporterInputPane from './site-importer-input-pane';
import { startImport } from 'calypso/lib/importer/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

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

class SiteImporter extends React.PureComponent {
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
			statusMessage: PropTypes.string,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		fromSite: PropTypes.string,
	};

	handleClick = () => {
		const {
			importerStatus: { type },
			site: { ID: siteId },
		} = this.props;

		startImport( siteId, type );

		this.props.recordTracksEvent( 'calypso_importer_main_start_clicked', {
			blog_id: siteId,
			importer_id: type,
		} );
	};

	render() {
		const { title, icon, description, uploadDescription } = this.props.importerData;
		const state = this.props.importerStatus;
		const isEnabled = appStates.DISABLED !== state.importerState;
		const showStart = includes( compactStates, state.importerState );
		const cardClasses = classNames( 'importer__site-importer-card', {
			'is-compact': showStart,
			'is-disabled': ! isEnabled,
		} );
		const cardProps = {
			displayAsLink: true,
			onClick: this.handleClick,
			tagName: 'button',
		};

		return (
			<Card className={ cardClasses } { ...( showStart ? cardProps : undefined ) }>
				<ImporterHeader importerStatus={ state } { ...{ icon, title, description } } />
				{ includes( importingStates, state.importerState ) && (
					<ImportingPane
						{ ...this.props }
						importerStatus={ state }
						sourceType={ title }
						site={ this.props.site }
					/>
				) }
				{ includes( uploadingStates, state.importerState ) && (
					<SiteImporterInputPane
						{ ...this.props }
						description={ uploadDescription }
						importerStatus={ state }
						onStartImport={ this.validateSite }
						isEnabled={ isEnabled }
					/>
				) }
			</Card>
		);
	}
}

export default connect( null, { recordTracksEvent } )( SiteImporter );

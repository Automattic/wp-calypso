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
import { isEnabled as isConfigEnabled } from 'config';
import { appStates } from 'state/imports/constants';
import { Card } from '@automattic/components';
import ErrorPane from './error-pane';
import ImporterHeader from './importer-header';
import ImportingPane from './importing-pane';
import UploadingPane from './uploading-pane';
import { startImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './file-importer.scss';

/**
 * Module variables
 */
const compactStates = [ appStates.DISABLED, appStates.INACTIVE ],
	importingStates = [
		appStates.IMPORT_FAILURE,
		appStates.IMPORT_SUCCESS,
		appStates.IMPORTING,
		appStates.MAP_AUTHORS,
	],
	uploadingStates = [
		appStates.UPLOAD_PROCESSING,
		appStates.READY_FOR_UPLOAD,
		appStates.UPLOAD_FAILURE,
		appStates.UPLOAD_SUCCESS,
		appStates.UPLOADING,
	];

class FileImporter extends React.PureComponent {
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
			importerState: PropTypes.string.isRequired,
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	handleClick = ( shouldStartImport ) => {
		const {
			importerStatus: { type },
			site: { ID: siteId },
		} = this.props;

		if ( shouldStartImport ) {
			startImport( siteId, type );
		}

		this.props.recordTracksEvent( 'calypso_importer_main_start_clicked', {
			blog_id: siteId,
			importer_id: type,
		} );
	};

	render() {
		const {
			title,
			icon,
			description,
			overrideDestination,
			uploadDescription,
		} = this.props.importerData;
		const { importerStatus, site } = this.props;
		const { errorData, importerState } = importerStatus;
		const isEnabled = appStates.DISABLED !== importerState;
		const showStart = includes( compactStates, importerState );
		const cardClasses = classNames( 'importer__file-importer-card', {
			'is-compact': showStart,
			'is-disabled': ! isEnabled,
		} );
		const cardProps = {
			displayAsLink: true,
			onClick: this.handleClick.bind( this, true ),
			tagName: 'button',
		};

		if ( isConfigEnabled( 'tools/migrate' ) && overrideDestination ) {
			/**
			 * Override where the user lands when they click the importer.
			 *
			 * This is used for the new Migration logic for the moment.
			 */
			cardProps.href = overrideDestination.replace( '%SITE_SLUG%', site.slug );
			cardProps.onClick = this.handleClick.bind( this, false );
		}

		return (
			<Card className={ cardClasses } { ...( showStart ? cardProps : undefined ) }>
				<ImporterHeader
					importerStatus={ importerStatus }
					{ ...{ icon, title, description, isEnabled, site } }
				/>
				{ errorData && <ErrorPane type={ errorData.type } description={ errorData.description } /> }
				{ includes( importingStates, importerState ) && (
					<ImportingPane importerStatus={ importerStatus } sourceType={ title } site={ site } />
				) }
				{ includes( uploadingStates, importerState ) && (
					<UploadingPane
						isEnabled={ isEnabled }
						description={ uploadDescription }
						importerStatus={ importerStatus }
						site={ site }
					/>
				) }
			</Card>
		);
	}
}

export default connect( null, { recordTracksEvent } )( FileImporter );

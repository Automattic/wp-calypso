import { Card } from '@automattic/components';
import clsx from 'clsx';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import ErrorPane from 'calypso/my-sites/importer/error-pane';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { startImport, cancelImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import ImportingPane from './importing-pane';
import UploadingPane from './uploading-pane';

import './file-importer.scss';

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
	appStates.UPLOAD_PROCESSING,
	appStates.READY_FOR_UPLOAD,
	appStates.UPLOAD_FAILURE,
	appStates.UPLOAD_SUCCESS,
	appStates.UPLOADING,
];

class FileImporter extends PureComponent {
	static propTypes = {
		importerData: PropTypes.shape( {
			title: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			description: PropTypes.node.isRequired,
			uploadDescription: PropTypes.node,
		} ).isRequired,
		importerStatus: PropTypes.shape( {
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			importerState: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		fromSite: PropTypes.string,
		nextStepUrl: PropTypes.string,
		skipNextStep: PropTypes.func,
	};

	handleClick = ( shouldStartImport ) => {
		const {
			importerStatus: { type },
			site: { ID: siteId },
		} = this.props;

		if ( shouldStartImport ) {
			this.props.startImport( siteId, type );
		}

		this.props.recordTracksEvent( 'calypso_importer_main_start_clicked', {
			blog_id: siteId,
			importer_id: type,
		} );
	};

	render() {
		const { title, overrideDestination, uploadDescription, optionalUrl } = this.props.importerData;
		const { importerStatus, site, fromSite, nextStepUrl, skipNextStep } = this.props;
		const { errorData, importerState } = importerStatus;
		const isEnabled = appStates.DISABLED !== importerState;
		const showStart = includes( compactStates, importerState );
		const cardClasses = clsx( 'importer__file-importer-card', {
			'is-compact': showStart,
			'is-disabled': ! isEnabled,
		} );
		const cardProps = {
			displayAsLink: true,
			onClick: this.handleClick.bind( this, true ),
			tagName: 'button',
		};

		if ( overrideDestination ) {
			/**
			 * Override where the user lands when they click the importer.
			 *
			 * This is used for the new Migration logic for the moment.
			 */
			cardProps.href = overrideDestination
				.replace( '%SITE_SLUG%', site.slug )
				.replace( '%SITE_ID%', site.ID );
			cardProps.onClick = this.handleClick.bind( this, false );
		}

		return (
			<Card className={ cardClasses } { ...( showStart ? cardProps : undefined ) }>
				{ errorData && (
					<ErrorPane
						type={ errorData.type }
						description={ errorData.description }
						siteSlug={ site.slug }
						code={ errorData.code }
						retryImport={ () => {
							this.props.cancelImport( site.ID, importerStatus.importerId );
						} }
					/>
				) }
				{ includes( importingStates, importerState ) && (
					<ImportingPane
						importerStatus={ importerStatus }
						sourceType={ title }
						site={ site }
						nextStepUrl={ nextStepUrl }
					/>
				) }
				{ includes( uploadingStates, importerState ) && (
					<UploadingPane
						isEnabled={ isEnabled }
						description={ uploadDescription }
						importerStatus={ importerStatus }
						site={ site }
						optionalUrl={ optionalUrl }
						fromSite={ fromSite }
						nextStepUrl={ nextStepUrl }
						skipNextStep={ skipNextStep }
					/>
				) }
			</Card>
		);
	}
}

export default connect( null, { recordTracksEvent, startImport, cancelImport } )( FileImporter );

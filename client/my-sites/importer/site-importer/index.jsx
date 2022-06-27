import { Card } from '@automattic/components';
import classNames from 'classnames';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import ImporterHeader from '../importer-header';
import ImportingPane from '../importing-pane';
import SiteImporterInputPane from './site-importer-input-pane';

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

class SiteImporter extends PureComponent {
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

		this.props.startImport( siteId, type );

		this.props.recordTracksEvent( 'calypso_importer_main_start_clicked', {
			blog_id: siteId,
			importer_id: type,
		} );
	};

	render() {
		const { title, icon, description, uploadDescription } = this.props.importerData;
		const { importerStatus } = this.props;
		const isEnabled = appStates.DISABLED !== importerStatus.importerState;
		const showStart = includes( compactStates, importerStatus.importerState );
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
				<ImporterHeader
					importerStatus={ importerStatus }
					icon={ icon }
					title={ title }
					description={ description }
				/>
				{ includes( importingStates, importerStatus.importerState ) && (
					<ImportingPane
						{ ...this.props }
						importerStatus={ importerStatus }
						sourceType={ title }
						site={ this.props.site }
					/>
				) }
				{ includes( uploadingStates, importerStatus.importerState ) && (
					<SiteImporterInputPane
						{ ...this.props }
						description={ uploadDescription }
						importerStatus={ importerStatus }
						onStartImport={ this.validateSite }
						isEnabled={ isEnabled }
						targetPlatform="wix"
					/>
				) }
			</Card>
		);
	}
}

export default connect( null, { recordTracksEvent, startImport } )( SiteImporter );

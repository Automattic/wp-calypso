import url from 'url'; // eslint-disable-line no-restricted-imports
import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { isEmpty, flowRight, trim, sortBy } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import TextInput from 'calypso/components/forms/form-text-input';
import { validateImportUrl } from 'calypso/lib/importer/url-validation';
import wpcom from 'calypso/lib/wp';
import ImporterActionButton from 'calypso/my-sites/importer/importer-action-buttons/action-button';
import ImporterCloseButton from 'calypso/my-sites/importer/importer-action-buttons/close-button';
import ImporterActionButtonContainer from 'calypso/my-sites/importer/importer-action-buttons/container';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { cancelImport, setUploadStartState } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	importSite,
	validateSiteIsImportable,
	resetSiteImporterImport,
	setValidationError,
	clearSiteImporterImport,
} from 'calypso/state/imports/site-importer/actions';
import {
	getError,
	getImportData,
	getImportStage,
	getValidatedSiteUrl,
	isLoading as isLoadingSelector,
} from 'calypso/state/imports/site-importer/selectors';
import ErrorPane from '../error-pane';
import SiteImporterSitePreview from './site-importer-site-preview';

import './site-importer-input-pane.scss';

const noop = () => {};

class SiteImporterInputPane extends Component {
	static displayName = 'SiteImporterSitePreview';

	static propTypes = {
		description: PropTypes.node,
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
		} ),
		onStartImport: PropTypes.func,
		disabled: PropTypes.bool,
		site: PropTypes.object,
		fromSite: PropTypes.string,
	};

	static defaultProps = { description: null, onStartImport: noop };

	state = {
		siteURLInput: this.props.fromSite || '',
		selectedEndpoint: '',
		availableEndpoints: [],
	};

	componentDidMount() {
		const { importStage } = this.props;
		if ( 'importable' === importStage ) {
			// Clear any leftover state from previous imports
			this.props.clearSiteImporterImport();
		}

		this.validateSite();

		if ( config.isEnabled( 'manage/import/site-importer-endpoints' ) ) {
			this.fetchEndpoints();
		}
	}

	componentWillUnmount() {
		const { importerStatus: { importerState, importerId } = {}, site: { ID: siteId } = {} } =
			this.props;

		if ( importerState !== appStates.UPLOAD_SUCCESS ) {
			this.props.cancelImport( siteId, importerId );
			this.resetImport();
		}
	}

	fetchEndpoints = () => {
		wpcom.req
			.get( {
				path: `/sites/${ this.props.site.ID }/site-importer/list-endpoints`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( resp ) => {
				const twoWeeksAgo = moment().subtract( 2, 'weeks' );
				const endpoints = resp.reduce( ( validEndpoints, endpoint ) => {
					const lastModified = moment( new Date( endpoint.lastModified ) );
					if ( lastModified.isBefore( twoWeeksAgo ) ) {
						return validEndpoints;
					}

					return [
						...validEndpoints,
						{
							name: endpoint.name,
							title: endpoint.name.replace( /^[a-zA-Z0-9]+-/i, '' ),
							lastModifiedTitle: lastModified.fromNow(),
							lastModifiedTimestamp: lastModified.unix(),
						},
					];
				}, [] );
				this.setState( {
					availableEndpoints: sortBy( endpoints, 'lastModifiedTimestamp' ).reverse().slice( 0, 20 ),
				} );
			} )
			.catch( ( err ) => {
				return err;
			} );
	};

	setEndpoint = ( e ) => {
		this.setState( { selectedEndpoint: e.target.value } );
	};

	setUrl = ( event ) => {
		this.setState( { siteURLInput: event.target.value } );
	};

	validateOnEnter = ( event ) => {
		event.key === 'Enter' && this.validateSite();
	};

	getApiParams = () => {
		const params = {};
		if ( this.state.selectedEndpoint ) {
			params.force_endpoint = this.state.selectedEndpoint;
		}
		if ( this.props.importerData.hasOwnProperty( 'engine' ) ) {
			params.engine = this.props.importerData.engine;
		}
		return params;
	};

	validateSite = () => {
		const siteURL = trim( this.state.siteURLInput );

		if ( ! siteURL ) {
			return;
		}

		const { hostname, pathname } = url.parse(
			siteURL.startsWith( 'http' ) ? siteURL : 'https://' + siteURL
		);

		if ( ! hostname ) {
			return;
		}

		const errorMessage = validateImportUrl( siteURL );

		if ( errorMessage ) {
			return this.props.setValidationError( errorMessage );
		}

		// normalized URL
		const urlForImport = hostname + pathname;

		return this.props.validateSiteIsImportable( {
			params: {
				...this.getApiParams(),
				site_url: urlForImport,
			},
			site: this.props.site,
			targetSiteUrl: urlForImport,
			targetPlatform: this.props.targetPlatform,
		} );
	};

	importSite = () => {
		// To track an "upload start"
		const { importerId } = this.props.importerStatus;
		this.props.setUploadStartState( importerId, this.props.validatedSiteUrl );

		this.props.importSite( {
			engine: this.props.importData.engine,
			importerStatus: this.props.importerStatus,
			params: this.getApiParams(),
			site: this.props.site,
			supportedContent: this.props.importData.supported,
			targetSiteUrl: this.props.validatedSiteUrl,
			unsupportedContent: this.props.importData.unsupported,
		} );
	};

	resetImport = () => {
		this.props.resetSiteImporterImport( {
			site: this.props.site,
			targetSiteUrl: this.props.validatedSiteUrl || this.state.siteURLInput,
			importStage: this.props.importStage,
		} );
	};

	render() {
		const { importerStatus, isEnabled, site, error, isLoading, importStage } = this.props;

		return (
			<div className="site-importer__site-importer-pane">
				{ importStage === 'idle' && (
					<div>
						<div className="site-importer__site-importer-url-input">
							<FormLabel>
								{ this.props.description }
								<TextInput
									label={ this.props.description }
									disabled={ isLoading }
									onChange={ this.setUrl }
									onKeyPress={ this.validateOnEnter }
									value={ this.state.siteURLInput }
									placeholder="example.com"
								/>
							</FormLabel>
						</div>
						{ this.state.availableEndpoints.length > 0 && (
							<FormSelect
								onChange={ this.setEndpoint }
								disabled={ isLoading }
								className="site-importer__site-importer-endpoint-select"
								value={ this.state.selectedEndpoint }
							>
								<option value="">Production Endpoint</option>
								{ this.state.availableEndpoints.map( ( endpoint ) => (
									<option key={ endpoint.name } value={ endpoint.name }>
										{ endpoint.title } ({ endpoint.lastModifiedTitle })
									</option>
								) ) }
							</FormSelect>
						) }
					</div>
				) }
				{ importStage === 'importable' && (
					<div className="site-importer__site-importer-confirm-site-pane">
						<SiteImporterSitePreview
							site={ site }
							siteURL={ this.props.validatedSiteUrl }
							importData={ this.props.importData }
							isLoading={ isLoading }
							resetImport={ this.resetImport }
							startImport={ this.importSite }
						/>
					</div>
				) }
				{ error && error.errorMessage && (
					<ErrorPane
						type={ error.errorType || 'importError' }
						description={ error.errorMessage }
						retryImport={ this.validateSite }
					/>
				) }
				{ importStage === 'idle' && (
					<ImporterActionButtonContainer>
						<ImporterActionButton
							primary
							disabled={ isLoading || isEmpty( this.state.siteURLInput ) }
							busy={ isLoading }
							onClick={ this.validateSite }
						>
							{ this.props.translate( 'Continue' ) }
						</ImporterActionButton>
						<ImporterCloseButton
							importerStatus={ importerStatus }
							site={ site }
							isEnabled={ isEnabled }
						/>
					</ImporterActionButtonContainer>
				) }
			</div>
		);
	}
}

export default flowRight(
	connect(
		( state ) => ( {
			error: getError( state ),
			importData: getImportData( state ),
			importStage: getImportStage( state ),
			isLoading: isLoadingSelector( state ),
			validatedSiteUrl: getValidatedSiteUrl( state ),
		} ),
		{
			recordTracksEvent,
			importSite,
			validateSiteIsImportable,
			resetSiteImporterImport,
			clearSiteImporterImport,
			setValidationError,
			cancelImport,
			setUploadStartState,
		}
	),
	localize
)( SiteImporterInputPane );

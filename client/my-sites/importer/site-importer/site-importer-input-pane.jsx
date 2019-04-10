/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isEmpty, noop, flowRight, has, get, trim, sortBy, reverse } from 'lodash';
import url from 'url';
import moment from 'moment';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import { validateImportUrl } from 'lib/importers/url-validation';
import TextInput from 'components/forms/form-text-input';
import FormSelect from 'components/forms/form-select';
import { recordTracksEvent } from 'state/analytics/actions';
import { setSelectedEditor } from 'state/selected-editor/actions';
import {
	importSite,
	validateSiteIsImportable,
	resetSiteImporterImport,
	setValidationError,
} from 'state/imports/site-importer/actions';
import ImporterActionButton from 'my-sites/importer/importer-action-buttons/action-button';
import ImporterCloseButton from 'my-sites/importer/importer-action-buttons/close-button';
import ImporterActionButtonContainer from 'my-sites/importer/importer-action-buttons/container';
import ErrorPane from '../error-pane';
import SiteImporterSitePreview from './site-importer-site-preview';

class SiteImporterInputPane extends React.Component {
	static displayName = 'SiteImporterSitePreview';

	static propTypes = {
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
		} ),
		onStartImport: PropTypes.func,
		disabled: PropTypes.bool,
		site: PropTypes.object,
	};

	static defaultProps = { description: null, onStartImport: noop };

	state = {
		siteURLInput: this.props.fromSite || '',
		selectedEndpoint: '',
		availableEndpoints: [],
	};

	componentDidMount() {
		this.validateSite();

		if ( config.isEnabled( 'manage/import/site-importer-endpoints' ) ) {
			this.fetchEndpoints();
		}
	}

	fetchEndpoints = () => {
		wpcom.req
			.get( {
				path: `/sites/${ this.props.site.ID }/site-importer/list-endpoints`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( resp => {
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
					availableEndpoints: reverse( sortBy( endpoints, 'lastModifiedTimestamp' ) ).slice(
						0,
						20
					),
				} );
			} )
			.catch( err => {
				return err;
			} );
	};

	setEndpoint = e => {
		this.setState( { selectedEndpoint: e.target.value } );
	};

	setUrl = event => {
		this.setState( { siteURLInput: event.target.value } );
	};

	validateOnEnter = event => {
		event.key === 'Enter' && this.validateSite();
	};

	getApiParams = () => {
		const params = {};
		if ( this.state.selectedEndpoint ) {
			params.force_endpoint = this.state.selectedEndpoint;
		}
		if ( has( this.props, 'importerData.engine' ) ) {
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
		} );
	};

	importSite = () => {
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

	renderUrlHint = () => {
		switch ( this.props.importerData.engine ) {
			case 'wix':
				return (
					<div>
						<p>
							{ this.props.translate( 'Please use one of following formats for the site URL:' ) }
						</p>
						<ul>
							<li>
								<span className="site-importer__site-importer-example-domain">example.com</span>
								{ ' - ' }
								{ this.props.translate( 'a paid custom domain' ) }
							</li>
							<li>
								<span className="site-importer__site-importer-example-domain">
									example-account.wixsite.com/my-site
								</span>
								{ ' - ' }
								{ this.props.translate( 'a free domain that comes with every site' ) }
							</li>
						</ul>
					</div>
				);
			case 'godaddy-gocentral':
				return (
					<div>
						<p>
							{ this.props.translate( 'Please use one of following formats for the site URL:' ) }
						</p>
						<ul>
							{ /* TODO(marekhrabe): add free URL format before public launch */ }
							<li>
								<span className="site-importer__site-importer-example-domain">example.com</span>
								{ ' - ' }
								{ this.props.translate( 'a paid custom domain' ) }
							</li>
						</ul>
					</div>
				);
		}
		return null;
	};

	render() {
		const { importerStatus, isEnabled, site, error, isLoading, importStage } = this.props;

		return (
			<div className="site-importer__site-importer-pane">
				{ importStage === 'idle' && (
					<div>
						<p>{ this.props.description }</p>
						<div className="site-importer__site-importer-url-input">
							<TextInput
								disabled={ isLoading }
								onChange={ this.setUrl }
								onKeyPress={ this.validateOnEnter }
								value={ this.state.siteURLInput }
								placeholder="https://example.com/"
							/>
						</div>
						{ this.state.availableEndpoints.length > 0 && (
							<FormSelect
								onChange={ this.setEndpoint }
								disabled={ isLoading }
								className="site-importer__site-importer-endpoint-select"
								value={ this.state.selectedEndpoint }
							>
								<option value="">Production Endpoint</option>
								{ this.state.availableEndpoints.map( endpoint => (
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
				{ importStage === 'idle' && this.renderUrlHint() }
				{ importStage === 'idle' && (
					<ImporterActionButtonContainer>
						<ImporterCloseButton
							importerStatus={ importerStatus }
							site={ site }
							isEnabled={ isEnabled }
						/>
						<ImporterActionButton
							primary
							disabled={ isLoading || isEmpty( this.state.siteURLInput ) }
							busy={ isLoading }
							onClick={ this.validateSite }
						>
							{ this.props.translate( 'Continue' ) }
						</ImporterActionButton>
					</ImporterActionButtonContainer>
				) }
			</div>
		);
	}
}

export default flowRight(
	connect(
		state => {
			const { isLoading, error, importData, importStage, validatedSiteUrl } = get(
				state,
				'imports.siteImporter',
				{}
			);

			return {
				isLoading,
				error,
				importData,
				importStage,
				validatedSiteUrl,
			};
		},
		{
			recordTracksEvent,
			setSelectedEditor,
			importSite,
			validateSiteIsImportable,
			resetSiteImporterImport,
			setValidationError,
		}
	),
	localize
)( SiteImporterInputPane );

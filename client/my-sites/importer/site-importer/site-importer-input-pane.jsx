/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Dispatcher from 'dispatcher';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isEmpty, noop, every, flow, has, defer, get, trim, sortBy, reverse } from 'lodash';
import url from 'url';
import moment from 'moment';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import wpLib from 'lib/wp';
import config from 'config';
import { validateImportUrl } from 'lib/importers/url-validation';

const wpcom = wpLib.undocumented();

import { toApi, fromApi } from 'lib/importer/common';

import {
	mapAuthor,
	startMappingAuthors,
	startImporting,
	createFinishUploadAction,
} from 'lib/importer/actions';
import user from 'lib/user';

import { appStates } from 'state/imports/constants';
import ErrorPane from '../error-pane';
import TextInput from 'components/forms/form-text-input';
import FormSelect from 'components/forms/form-select';

import SiteImporterSitePreview from './site-importer-site-preview';

import { prefetchmShotsPreview } from './site-preview-actions';

import { recordTracksEvent } from 'state/analytics/actions';

import { setSelectedEditor } from 'state/selected-editor/actions';

import ImporterActionButton from 'my-sites/importer/importer-action-buttons/action-button';
import ImporterCloseButton from 'my-sites/importer/importer-action-buttons/close-button';
import ImporterActionButtonContainer from 'my-sites/importer/importer-action-buttons/container';

const NO_ERROR_STATE = {
	error: false,
	errorMessage: '',
	errorType: null,
};
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
		// TODO this is bad, make it better. Both appStates and state should be unified in one.
		importStage: 'idle',
		error: false,
		errorMessage: '',
		errorType: null,
		siteURLInput: this.props.fromSite || '',
		selectedEndpoint: '',
		availableEndpoints: [],
	};

	UNSAFE_componentWillMount = () => {
		if ( config.isEnabled( 'manage/import/site-importer-endpoints' ) ) {
			this.fetchEndpoints();
		}
	};

	componentDidMount() {
		this.validateSite();
	}

	// TODO This can be improved if we move to Redux.
	UNSAFE_componentWillReceiveProps = nextProps => {
		// TODO test on a site without posts
		const newImporterState = nextProps.importerStatus.importerState;
		const oldImporterState = this.props.importerStatus.importerState;
		const singleAuthorSite = get( this.props.site, 'single_user_site', true );

		if ( newImporterState !== oldImporterState && newImporterState === appStates.UPLOAD_SUCCESS ) {
			// WXR was uploaded, map the authors
			if ( singleAuthorSite ) {
				defer( props => {
					const currentUserData = user().get();
					const currentUser = {
						...currentUserData,
						name: currentUserData.display_name,
					};

					// map all the authors to the current user
					// TODO: when converting to redux, allow for multiple mappings in a single action
					props.importerStatus.customData.sourceAuthors.forEach( author => {
						mapAuthor( props.importerStatus.importerId, author, currentUser );
					} );
				}, nextProps );
			} else {
				defer( props => startMappingAuthors( props.importerStatus.importerId ), nextProps );

				this.props.recordTracksEvent( 'calypso_site_importer_map_authors_multi', {
					blog_id: this.props.site.ID,
					site_url: this.state.importSiteURL,
				} );
			}

			// Do not continue execution of the function as the rest should be executed on the next update.
			return;
		}

		if ( singleAuthorSite && has( this.props, 'importerStatus.customData.sourceAuthors' ) ) {
			// Authors have been mapped, start the import
			const oldAuthors = every( this.props.importerStatus.customData.sourceAuthors, 'mappedTo' );
			const newAuthors = every( nextProps.importerStatus.customData.sourceAuthors, 'mappedTo' );

			if ( oldAuthors === false && newAuthors === true ) {
				defer( props => {
					startImporting( props.importerStatus );
				}, nextProps );

				this.props.recordTracksEvent( 'calypso_site_importer_map_authors_single', {
					blog_id: this.props.site.ID,
					site_url: this.state.importSiteURL,
				} );
			}
		}
	};

	fetchEndpoints = () => {
		wpcom.wpcom.req
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
			this.setState( {
				loading: false,
				error: true,
				errorMessage,
				errorType: 'validationError',
			} );
			return;
		}

		// normalized URL
		const urlForImport = hostname + pathname;

		this.setState( {
			loading: true,
			...NO_ERROR_STATE,
		} );

		this.props.recordTracksEvent( 'calypso_site_importer_validate_site_start', {
			blog_id: this.props.site.ID,
			site_url: urlForImport,
		} );

		prefetchmShotsPreview( urlForImport );

		const params = this.getApiParams();
		params.site_url = urlForImport;

		wpcom.wpcom.req
			.get( {
				path: `/sites/${ this.props.site.ID }/site-importer/is-site-importable?${ stringify(
					params
				) }`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( resp => {
				this.setState( {
					importStage: 'importable',
					importData: {
						title: resp.site_title,
						supported: resp.supported_content,
						unsupported: resp.unsupported_content,
						favicon: resp.favicon,
						engine: resp.engine,
						url: resp.url,
					},
					loading: false,
					importSiteURL: resp.site_url,
				} );

				this.props.recordTracksEvent( 'calypso_site_importer_validate_site_success', {
					blog_id: this.props.site.ID,
					site_url: resp.site_url,
					supported_content: resp.supported_content
						.slice( 0 )
						.sort()
						.join( ', ' ),
					unsupported_content: resp.unsupported_content
						.slice( 0 )
						.sort()
						.join( ', ' ),
					site_engine: resp.engine,
				} );
			} )
			.catch( err => {
				this.setState( {
					loading: false,
					error: true,
					errorMessage: `${ err.message }`,
				} );

				this.props.recordTracksEvent( 'calypso_site_importer_validate_site_fail', {
					blog_id: this.props.site.ID,
					site_url: urlForImport,
				} );
			} );
	};

	importSite = () => {
		this.setState( {
			loading: true,
			...NO_ERROR_STATE,
		} );

		this.props.recordTracksEvent( 'calypso_site_importer_start_import_request', {
			blog_id: this.props.site.ID,
			site_url: this.state.importSiteURL,
			supported_content: this.state.importData.supported
				.slice( 0 )
				.sort()
				.join( ', ' ),
			unsupported_content: this.state.importData.unsupported
				.slice( 0 )
				.sort()
				.join( ', ' ),
			site_engine: this.state.importData.engine,
		} );

		wpcom.wpcom.req
			.post( {
				path: `/sites/${ this.props.site.ID }/site-importer/import-site?${ stringify(
					this.getApiParams()
				) }`,
				apiNamespace: 'wpcom/v2',
				formData: [
					[ 'import_status', JSON.stringify( toApi( this.props.importerStatus ) ) ],
					[ 'site_url', this.state.importSiteURL ],
				],
			} )
			.then( resp => {
				this.setState( { loading: false } );

				this.props.recordTracksEvent( 'calypso_site_importer_start_import_success', {
					blog_id: this.props.site.ID,
					site_url: this.state.importSiteURL,
					supported_content: this.state.importData.supported
						.slice( 0 )
						.sort()
						.join( ', ' ),
					unsupported_content: this.state.importData.unsupported
						.slice( 0 )
						.sort()
						.join( ', ' ),
					site_engine: this.state.importData.engine,
				} );

				// At this point we're assuming that an import is going to happen
				// so we set the user's editor to Gutenberg in order to make sure
				// that the posts aren't mangled by the classic editor.
				if ( 'engine6' === get( this.props, 'importerData.engine' ) ) {
					this.props.setSelectedEditor( this.props.site.ID, 'gutenberg' );
				}

				const data = fromApi( resp );
				const action = createFinishUploadAction( this.props.importerStatus.importerId, data );
				defer( () => {
					Dispatcher.handleViewAction( action );
				} );
			} )
			.catch( err => {
				this.props.recordTracksEvent( 'calypso_site_importer_start_import_fail', {
					blog_id: this.props.site.ID,
					site_url: this.state.importSiteURL,
					supported_content: this.state.importData.supported
						.slice( 0 )
						.sort()
						.join( ', ' ),
					unsupported_content: this.state.importData.unsupported
						.slice( 0 )
						.sort()
						.join( ', ' ),
					site_engine: this.state.importData.engine,
				} );

				this.setState( {
					loading: false,
					error: true,
					errorMessage: `${ err.message } (${ err.code })`,
				} );
			} );
	};

	resetImport = () => {
		this.props.recordTracksEvent( 'calypso_site_importer_reset_import', {
			blog_id: this.props.site.ID,
			site_url: this.state.importSiteURL || this.state.siteURLInput,
			previous_stage: this.state.importStage,
		} );

		this.setState( {
			loading: false,
			importStage: 'idle',
			...NO_ERROR_STATE,
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
			case 'engine6':
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
		const { importerStatus, isEnabled, site } = this.props;

		return (
			<div className="site-importer__site-importer-pane">
				{ this.state.importStage === 'idle' && (
					<div>
						<p>{ this.props.description }</p>
						<div className="site-importer__site-importer-url-input">
							<TextInput
								disabled={ this.state.loading }
								onChange={ this.setUrl }
								onKeyPress={ this.validateOnEnter }
								value={ this.state.siteURLInput }
								placeholder="https://example.com/"
							/>
						</div>
						{ this.state.availableEndpoints.length > 0 && (
							<FormSelect
								onChange={ this.setEndpoint }
								disabled={ this.state.loading }
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
				{ this.state.importStage === 'importable' && (
					<div className="site-importer__site-importer-confirm-site-pane">
						<SiteImporterSitePreview
							site={ site }
							siteURL={ this.state.importSiteURL }
							importData={ this.state.importData }
							isLoading={ this.state.loading }
							resetImport={ this.resetImport }
							startImport={ this.importSite }
						/>
					</div>
				) }
				{ this.state.error && (
					<ErrorPane
						type={ this.state.errorType || 'importError' }
						description={ this.state.errorMessage }
						retryImport={ this.validateSite }
					/>
				) }
				{ this.state.importStage === 'idle' && this.renderUrlHint() }
				{ this.state.importStage === 'idle' && (
					<ImporterActionButtonContainer>
						<ImporterCloseButton
							importerStatus={ importerStatus }
							site={ site }
							isEnabled={ isEnabled }
						/>
						<ImporterActionButton
							primary
							disabled={ this.state.loading || isEmpty( this.state.siteURLInput ) }
							busy={ this.state.loading }
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

export default flow(
	connect(
		null,
		{ recordTracksEvent, setSelectedEditor }
	),
	localize
)( SiteImporterInputPane );

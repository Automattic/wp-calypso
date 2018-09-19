/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Dispatcher from 'dispatcher';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop, every, has, defer, get, trim, sortBy, reverse } from 'lodash';
import url from 'url';
import moment from 'moment';

/**
 * Internal dependencies
 */
import wpLib from 'lib/wp';
import config from 'config';

const wpcom = wpLib.undocumented();

import { toApi, fromApi } from 'lib/importer/common';

import { startMappingAuthors, startImporting, mapAuthor, finishUpload } from 'lib/importer/actions';
import user from 'lib/user';

import { appStates } from 'state/imports/constants';
import Button from 'components/forms/form-button';
import ErrorPane from '../error-pane';
import TextInput from 'components/forms/form-text-input';
import FormSelect from 'components/forms/form-select';

import SiteImporterSitePreview from './site-importer-site-preview';
import { connectDispatcher } from '../dispatcher-converter';

import { loadmShotsPreview } from './site-preview-actions';

import { recordTracksEvent } from 'state/analytics/actions';

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

	componentWillMount = () => {
		if ( config.isEnabled( 'manage/import/site-importer-endpoints' ) ) {
			this.fetchEndpoints();
		}
	};

	componentDidMount() {
		this.validateSite();
	}

	// TODO This can be improved if we move to Redux.
	componentWillReceiveProps = nextProps => {
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

					const mappingFunction = this.props.mapAuthorFor( props.importerStatus.importerId );

					// map all the authors to the current user
					props.importerStatus.customData.sourceAuthors.forEach( author => {
						mappingFunction( author, currentUser );
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

	validateSite = () => {
		const siteURL = trim( this.state.siteURLInput );

		if ( ! siteURL ) {
			return;
		}

		const { hostname, pathname } = url.parse(
			siteURL.startsWith( 'http' ) ? siteURL : 'https://' + siteURL
		);

		let errorMessage;
		if ( ! siteURL ) {
			errorMessage = this.props.translate( 'Please enter a valid URL.' );
		} else if ( hostname === 'editor.wix.com' || hostname === 'www.wix.com' ) {
			errorMessage = this.props.translate(
				"You've entered the URL for the Wix editor, which only you can access. Please enter your site's public URL. It should look like one of the examples below."
			);
		} else if ( hostname.indexOf( '.wixsite.com' ) > -1 && pathname === '/' ) {
			errorMessage = this.props.translate(
				"You haven't entered the full URL. Please include the part of the URL that comes after wixsite.com. See below for an example."
			);
		}

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

		loadmShotsPreview( {
			url: urlForImport,
			maxRetries: 1,
		} ).catch( noop ); // We don't care about the error, this is just a preload

		const endpointParam =
			this.state.selectedEndpoint && `&force_endpoint=${ this.state.selectedEndpoint }`;

		wpcom.wpcom.req
			.get( {
				path: `/sites/${
					this.props.site.ID
				}/site-importer/is-site-importable?site_url=${ urlForImport }${ endpointParam }`,
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

		const endpointParam =
			this.state.selectedEndpoint && `?force_endpoint=${ this.state.selectedEndpoint }`;

		wpcom.wpcom.req
			.post( {
				path: `/sites/${ this.props.site.ID }/site-importer/import-site${ endpointParam }`,
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

				const data = fromApi( resp );
				const action = finishUpload( this.props.importerStatus.importerId )( data );
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

	render() {
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
							<Button
								primary={ true }
								disabled={ this.state.loading }
								busy={ this.state.loading }
								onClick={ this.validateSite }
							>
								{ this.props.translate( 'Continue' ) }
							</Button>
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
							siteURL={ this.state.importSiteURL }
							importData={ this.state.importData }
							isLoading={ this.state.loading }
							resetImport={ this.resetImport }
							startImport={ this.importSite }
							site={ this.props.site }
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
				{ this.state.importStage === 'idle' && (
					<div>
						<p>
							{ this.props.translate( 'Please use one of following formats for the site URL:' ) }
						</p>
						<ul>
							<li>
								<span className="site-importer__site-importer-example-domain">example.com</span> -{' '}
								{ this.props.translate( 'a paid custom domain' ) }
							</li>
							<li>
								<span className="site-importer__site-importer-example-domain">
									example-account.wixsite.com/my-site
								</span>{' '}
								- { this.props.translate( 'a free domain that comes with every site' ) }
							</li>
						</ul>
					</div>
				) }
			</div>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	mapAuthorFor: importerId => ( source, target ) =>
		defer( () => {
			dispatch( mapAuthor( importerId, source, target ) );
		} ),
} );

export default connect(
	null,
	{ recordTracksEvent }
)( connectDispatcher( null, mapDispatchToProps )( localize( SiteImporterInputPane ) ) );

/** @format */

/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { noop, every, has, defer, get } from 'lodash';

/**
 * Internal dependencies
 */
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

import { toApi, fromApi } from 'lib/importer/common';

import { startMappingAuthors, startImporting, mapAuthor, finishUpload } from 'lib/importer/actions';
import user from 'lib/user';

import { appStates } from 'state/imports/constants';
import Button from 'components/forms/form-button';
import ErrorPane from '../error-pane';
import TextInput from 'components/forms/form-text-input';

import SiteImporterSitePreview from './site-importer-site-preview';
import { connectDispatcher } from '../dispatcher-converter';

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
	};

	static defaultProps = { description: null, onStartImport: noop };

	state = {
		// TODO this is bad, make it better. Both appStates and state should be unified in one.
		importStage: 'idle',
		error: false,
		errorMessage: '',
		siteURLInput: '',
	};

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
			}
		}
	};

	resetErrors = () => {
		this.setState( {
			error: false,
			errorMessage: '',
		} );
	};

	setUrl = event => {
		this.setState( { siteURLInput: event.target.value } );
	};

	validateSite = () => {
		const siteURL = this.state.siteURLInput;

		this.setState( { loading: true }, this.resetErrors );

		wpcom.wpcom.req
			.get( {
				path: `/sites/${
					this.props.site.ID
				}/site-importer/is-site-importable?site_url=${ siteURL }`,
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
					},
					loading: false,
					importSiteURL: siteURL,
				} );
			} )
			.catch( err => {
				this.setState( {
					loading: false,
					error: true,
					errorMessage: `${ err.message }`,
				} );
			} );
	};

	importSite = () => {
		this.setState( { loading: true }, this.resetErrors );

		wpcom.wpcom.req
			.post( {
				path: `/sites/${ this.props.site.ID }/site-importer/import-site`,
				apiNamespace: 'wpcom/v2',
				formData: [
					[ 'import_status', JSON.stringify( toApi( this.props.importerStatus ) ) ],
					[ 'site_url', this.state.importSiteURL ],
				],
			} )
			.then( resp => {
				this.setState( { loading: false } );

				const data = fromApi( resp );
				const action = finishUpload( this.props.importerStatus.importerId )( data );
				defer( () => {
					Dispatcher.handleViewAction( action );
				} );
			} )
			.catch( err => {
				this.setState( {
					loading: false,
					error: true,
					errorMessage: `${ err.message } (${ err.code })`,
				} );
			} );
	};

	resetImport = () => {
		this.setState(
			{
				loading: false,
				importStage: 'idle',
			},
			this.resetErrors
		);
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
								value={ this.state.siteURLInput }
							/>
							<Button
								disabled={ this.state.loading }
								isPrimary={ true }
								onClick={ this.validateSite }
							>
								{ this.props.translate( 'Continue' ) }
							</Button>
						</div>
					</div>
				) }
				{ this.state.importStage === 'importable' && (
					<div className="site-importer__site-importer-confirm-site-pane">
						<SiteImporterSitePreview
							siteURL={ this.state.importSiteURL }
							importData={ this.state.importData }
							isLoading={ this.state.loading }
						/>
						<div className="site-importer__site-importer-confirm-site-pane-container">
							<Button disabled={ this.state.loading } onClick={ this.importSite }>
								{ this.props.translate( 'Yes! Start import' ) }
							</Button>
							<Button
								disabled={ this.state.loading }
								isPrimary={ false }
								onClick={ this.resetImport }
							>
								{ this.props.translate( 'No' ) }
							</Button>
						</div>
					</div>
				) }
				{ this.state.error && (
					<ErrorPane type="importError" description={ this.state.errorMessage } />
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

export default connectDispatcher( null, mapDispatchToProps )( localize( SiteImporterInputPane ) );

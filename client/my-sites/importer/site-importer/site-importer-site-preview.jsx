/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';
import request from 'superagent';
import { map } from 'lodash';
/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';
import Button from 'components/forms/form-button';

class SiteImporterSitePreview extends React.Component {
	static propTypes = {
		siteURL: PropTypes.string.isRequired,
		importData: PropTypes.object,
		isLoading: PropTypes.bool,
		startImport: PropTypes.func,
		resetImport: PropTypes.func,
	};

	state = {
		previewRetries: 0,
		siteURL: `https://s0.wp.com/mshots/v1/${ this.props.siteURL }`,
		sitePreviewImage: '',
		sitePreviewFailed: false,
		loadingPreviewImage: true,
	};

	componentDidMount() {
		this.loadSitePreview();
	}

	loadSitePreview = () => {
		this.setState( { loadingPreviewImage: true } );

		const maxRetries = 1;
		const retryTimeout = 1500;
		if ( this.state.previewRetries > maxRetries ) {
			this.setState( {
				sitePreviewImage: '',
				sitePreviewFailed: true,
				loadingPreviewImage: false,
			} );
			return;
		}

		this.setState( { previewRetries: this.state.previewRetries + 1 } );

		request
			.get( this.state.siteURL )
			.responseType( 'blob' )
			.then( res => {
				if ( res.type === null || res.type === 'image/gif' ) {
					setTimeout( this.loadSitePreview, retryTimeout );
				} else if ( res.type === 'image/jpeg' ) {
					const fReader = new FileReader();
					fReader.onload = ev => {
						this.setState( {
							sitePreviewImage: ev.target.result,
							loadingPreviewImage: false,
						} );
					};
					fReader.readAsDataURL( res.xhr.response );
				}
			} )
			.catch( () => {
				// todo error or retry? - test with possible 4xx, 5xx errors
			} );
	};

	render = () => {
		const isLoading = this.props.isLoading || this.state.loadingPreviewImage;
		const isError = this.state.sitePreviewFailed;

		const containerClass = classNames( 'site-importer__site-preview-overlay-container', {
			isLoading,
		} );

		return (
			<div>
				<div className="site-importer__site-importer-confirm-site-pane-container">
					<div className="site-importer__site-importer-confirm-site-label">
						{ this.props.translate( 'Is this your site?' ) }
					</div>
					<Button disabled={ isLoading } onClick={ this.props.startImport }>
						{ this.props.translate( 'Yes! Start import' ) }
					</Button>
					<Button disabled={ isLoading } isPrimary={ false } onClick={ this.props.resetImport }>
						{ this.props.translate( 'No' ) }
					</Button>
				</div>
				<div className={ containerClass }>
					{ this.state.sitePreviewImage && (
						<div className="site-importer__site-preview-column-container">
							<div className="site-importer__site-preview-container">
								<div className="site-importer__site-preview-browser-chrome">
									<span>● ● ●</span>
								</div>
								<div className="site-importer__site-preview-image">
									<img
										className="site-importer__site-preview-favicon"
										src={ this.state.sitePreviewImage }
										alt="Site favicon"
									/>
								</div>
							</div>
							<div className="site-importer__site-preview-import-content">
								<p>{ this.props.translate( 'We will import:' ) }</p>
								{ this.props.importData.supported &&
									this.props.importData.supported.length && (
										<ul>
											{ map( this.props.importData.supported, ( suppApp, idx ) => (
												<li key={ idx }>{ suppApp }</li>
											) ) }
										</ul>
									) }
							</div>
						</div>
					) }
					{ isLoading && (
						<div className="site-importer__site-preview-loading-overlay">
							<Spinner />
						</div>
					) }
					{ isError && (
						<div className="site-importer__site-preview-error">
							Unable to load preview, please try again later
						</div>
					) }
				</div>
			</div>
		);
	};
}

export default localize( SiteImporterSitePreview );

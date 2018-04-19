/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { map } from 'lodash';
import classNames from 'classnames';
import request from 'superagent';

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
		siteURL: `https://s0.wp.com/mshots/v1/${ this.props.siteURL }${ Math.random() }`, // TODO remove before going to prod
		sitePreviewImage: '',
		sitePreviewFailed: false,
		loadingPreviewImage: false,
	};

	componentDidMount() {
		this.setState( { loadingPreviewImage: true } );
		this.loadSitePreview();
	}

	loadSitePreview = () => {
		const maxRetries = 40;
		const retryTimeout = 1500;
		if ( this.state.previewRetries > maxRetries ) {
			this.setState( { sitePreviewImage: '', sitePreviewFailed: true } );
			return;
		}

		this.setState( { previewRetries: this.state.previewRetries + 1 } );

		// todo loader
		// disable yes
		request
			.get( this.state.siteURL )
			.responseType( 'blob' )
			.then( res => {
				if ( res.type === null || res.type === 'image/gif' ) {
					setTimeout( this.loadSitePreview, retryTimeout );
				} else if ( res.type === 'image/jpeg' ) {
					// TODO end loader

					// const blob = new Blob( [ ], { type: 'image/jpeg' } )
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
			.catch( ( err, res ) => {
				// todo error or retry?
				debugger;
			} );
	};

	render = () => {
		const isLoading = this.props.isLoading || this.state.loadingPreviewImage;

		const containerClass = classNames( 'site-importer__site-preview-overlay-container', {
			isLoading,
		} );

		return (
			<div>
				<div className="site-importer__site-importer-confirm-site-pane-container">
					<p className="site-importer__site-importer-confirm-site-label">
						{ this.props.translate( 'Is this your site?' ) }
					</p>
					<Button disabled={ isLoading } onClick={ this.props.startImport }>
						{ this.props.translate( 'Yes! Start import' ) }
					</Button>
					<Button disabled={ isLoading } isPrimary={ false } onClick={ this.props.resetImport }>
						{ this.props.translate( 'No' ) }
					</Button>
				</div>
				<div className={ containerClass }>
					<div className="site-importer__site-preview-container">
						<div className="site-importer__site-preview-site-meta">
							{ this.state.sitePreviewImage && (
								<p>
									<img
										className="site-importer__site-preview-favicon"
										src={ this.state.sitePreviewImage }
										alt="Site favicon"
									/>
								</p>
							) }
						</div>
					</div>
					{ isLoading && (
						<div className="site-importer__site-preview-loading-overlay">
							<Spinner />
						</div>
					) }
				</div>
			</div>
		);
	};
}

export default localize( SiteImporterSitePreview );

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
import { retry } from '../../../layout/error';

class SiteImporterSitePreview extends React.Component {
	static propTypes = {
		siteURL: PropTypes.string.isRequired,
		importData: PropTypes.object,
		isLoading: PropTypes.bool,
	};

	state = {
		previewRetries: 0,
		siteURL: `https://s0.wp.com/mshots/v1/${ this.props.siteURL }${ Math.random() }`, // TODO remove before going to prod
		sitePreviewImage: '',
		sitePreviewFailed: false,
	};

	componentDidMount() {
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
						this.setState( { sitePreviewImage: ev.target.result } );
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
		const containerClass = classNames( 'site-importer__site-preview-overlay-container', {
			isLoading: this.props.isLoading,
		} );

		return (
			<div className={ containerClass }>
				<div className="site-importer__site-preview-container">
					<div className="site-importer__site-preview-site-meta">
						<p>
							<img
								className="site-importer__site-preview-favicon"
								src={ this.state.sitePreviewImage }
								alt="Site favicon"
							/>
						</p>
						<div style={ { display: 'none' } }>
							<p>Importing:</p>
							{ this.props.importData.supported &&
								this.props.importData.supported.length && (
									<ul>
										{ map( this.props.importData.supported, ( suppApp, idx ) => (
											<li key={ idx }>{ suppApp }</li>
										) ) }
										<li>Basic pages</li>
									</ul>
								) }
						</div>
					</div>
				</div>
				{ this.props.isLoading && (
					<div className="site-importer__site-preview-loading-overlay">
						<Spinner />
					</div>
				) }
			</div>
		);
	};
}

export default localize( SiteImporterSitePreview );

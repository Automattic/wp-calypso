/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { map } from 'lodash';
/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';
import Button from 'components/forms/form-button';
import ErrorPane from '../error-pane';
import { loadmShotsPreview } from './site-preview-actions';

import { recordTracksEvent } from 'state/analytics/actions';

class SiteImporterSitePreview extends React.Component {
	static propTypes = {
		siteURL: PropTypes.string.isRequired,
		importData: PropTypes.object,
		isLoading: PropTypes.bool,
		startImport: PropTypes.func,
		resetImport: PropTypes.func,
		site: PropTypes.object,
	};

	state = {
		previewRetries: 0,
		siteURL: this.props.siteURL,
		sitePreviewImage: '',
		sitePreviewFailed: false,
		loadingPreviewImage: true,
		previewStartTime: 0,
	};

	componentDidMount() {
		this.loadSitePreview();
	}

	loadSitePreview = () => {
		this.setState( { loadingPreviewImage: true, previewStartTime: Date.now() } );

		loadmShotsPreview( {
			url: this.state.siteURL,
			maxRetries: 30,
			retryTimeout: 1000,
		} )
			.then( imageBlob => {
				this.setState( {
					loadingPreviewImage: false,
					sitePreviewImage: imageBlob,
					sitePreviewFailed: false,
				} );

				this.props.recordTracksEvent( 'calypso_site_importer_site_preview_done', {
					blog_id: this.props.site.ID,
					site_url: this.state.siteURL,
					time_taken_ms: Date.now() - this.state.previewStartTime,
				} );
			} )
			.catch( () => {
				this.setState( {
					loadingPreviewImage: false,
					sitePreviewImage: '',
					sitePreviewFailed: true,
				} );

				this.props.recordTracksEvent( 'calypso_site_importer_site_preview_failed', {
					blog_id: this.props.site.ID,
					site_url: this.state.siteURL,
					time_taken_ms: Date.now() - this.state.previewStartTime,
				} );
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
				{ ! isError && (
					<div>
						{ ! isLoading && (
							<div>
								<div className="site-importer__site-importer-confirm-site-pane-container">
									<div className="site-importer__site-importer-confirm-site-label">
										{ this.props.translate( 'Is this your site?' ) }
									</div>
									<Button disabled={ isLoading } onClick={ this.props.startImport }>
										{ this.props.translate( 'Yes! Start import' ) }
									</Button>
									<Button
										disabled={ isLoading }
										isPrimary={ false }
										onClick={ this.props.resetImport }
									>
										{ this.props.translate( 'No' ) }
									</Button>
								</div>
								<div className={ containerClass }>
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
								</div>
							</div>
						) }
						{ isLoading && (
							<div className="site-importer__site-preview-loading-overlay">
								<Spinner />
							</div>
						) }
					</div>
				) }
				{ isError && (
					<div className="site-importer__site-preview-error">
						<ErrorPane
							type="importError"
							description={ this.props.translate(
								'Unable to load site preview. Please try again later.'
							) }
						/>
					</div>
				) }
			</div>
		);
	};
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( SiteImporterSitePreview ) );

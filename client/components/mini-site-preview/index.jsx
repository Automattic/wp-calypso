/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import { loadmShotsPreview } from 'my-sites/importer/site-importer/site-preview-actions';

export class MiniSitePreviewWrapper extends Component {
	static propTypes = {
		siteURL: PropTypes.string.isRequired,
		onFetchSuccess: PropTypes.func,
		onFetchError: PropTypes.func,
	};

	state = {
		previewRetries: 0,
		siteURL: this.props.siteURL,
		sitePreviewImage: '',
		sitePreviewFailed: false,
		loadingPreviewImage: true,
	};

	componentDidMount() {
		this.loadSitePreview();
	}

	loadSitePreview = () => {
		this.setState( { loadingPreviewImage: true, previewStartTime: Date.now() } );

		loadmShotsPreview( {
			url: this.props.siteURL,
			maxRetries: 30,
			retryTimeout: 1000,
		} )
			.then( imageBlob => {
				this.setState( {
					loadingPreviewImage: false,
					sitePreviewImage: imageBlob,
					sitePreviewFailed: false,
				} );

				invoke( this.props, 'onFetchSuccess', {
					time_taken_ms: Date.now() - this.state.previewStartTime,
				} );
			} )
			.catch( () => {
				this.setState( {
					loadingPreviewImage: false,
					sitePreviewImage: '',
					sitePreviewFailed: true,
				} );

				invoke( this.props, 'onFetchError', {
					time_taken_ms: Date.now() - this.state.previewStartTime,
				} );
			} );
	};

	render() {
		const { sitePreviewImage, loadingPreviewImage } = this.state;

		// TODO: Handle error cases
		return (
			<div className="mini-site-preview">
				<div className="mini-site-preview__browser-chrome">
					<span>● ● ●</span>
				</div>
				{ loadingPreviewImage ? (
					<div className="mini-site-preview__image placeholder" />
				) : (
					<div className="mini-site-preview__image">
						<img
							className="mini-site-preview__favicon"
							src={ sitePreviewImage }
							alt="Site favicon"
						/>
					</div>
				) }
			</div>
		);
	}
}

export default MiniSitePreviewWrapper;

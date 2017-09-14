/**
 * External dependencies
 */
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import SocialLogo from 'social-logos';
import page from 'page';
import { uniq } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import SectionHeader from 'components/section-header';
import { VideoPressFileTypes } from 'lib/media/constants';

class MediaLibraryUploadControls extends Component {
	uploadFiles = ( event ) => {
		if ( event.target.files && this.props.site ) {
			MediaActions.clearValidationErrors( this.props.site.ID );
			MediaActions.add( this.props.site.ID, event.target.files );
		}

		ReactDom.findDOMNode( this.refs.form ).reset();
		this.props.onAddMedia();
		analytics.mc.bumpStat( 'editor_upload_via', 'add_button' );
	};

	onUploadClick = () => {
		if ( this.props.href ) {
			page( this.props.href );
		}
	};

	/**
	 * Returns a string of comma-separated file extensions supported for the
	 * current site, to be used as the `accept` attribute in an `input` element
	 * of type `file`. This is a non-standard use of the `accept` attribute,
	 * but is supported in Internet Explorer and Chrome browsers. Further input
	 * validation will occur when attempting to upload the file.
	 *
	 * @return {string} Supported file extensions, as comma-separated string
	 */
	getInputAccept = () => {
		if ( ! MediaUtils.isSiteAllowedFileTypesToBeTrusted( this.props.site ) ) {
			return null;
		}
		const allowedFileTypesForSite = MediaUtils.getAllowedFileTypesForSite( this.props.site );

		return uniq( allowedFileTypesForSite.concat( VideoPressFileTypes ) ).map( ( type ) => `.${ type }` ).join();
	};

	render() {
		const { translate } = this.props;

		return (
			<form ref="form">
				<div className="media-library__upload-controls-container">
					<div>
						<SectionHeader
							className="media-library__upload-controls-header"
							label={ translate( 'Upload from' ) } />
						<Card className="media-library__upload-controls-options">
							<CompactCard className="media-library__upload-controls-option">
								<Gridicon icon="computer" size={ 18 } />
								<span className="media-library__upload-controls-option-name">{ translate( 'Computer' ) }</span>
								<Gridicon icon="chevron-right" className="media-library__upload-controls-indicator card__link-indicator" />
								<input
									className="media-library__upload-controls-file-input"
									type="file"
									accept={ this.getInputAccept() }
									multiple
									onChange={ this.uploadFiles }
									onClick={ this.onUploadClick } />
							</CompactCard>
							<CompactCard className="media-library__upload-controls-option" href="#">
								<Gridicon icon="domains" size={ 18 } />
								<span className="media-library__upload-controls-option-name">{ translate( 'URL' ) }</span>
							</CompactCard>
							<CompactCard className="media-library__upload-controls-option" href="#">
								<SocialLogo icon="google" size={ 18 } />
								<span className="media-library__upload-controls-option-name">{ translate( 'Google Photos' ) }</span>
							</CompactCard>
						</Card>
					</div>
					<div className="media-library__upload-controls-drop-zone-container">
						<Gridicon icon="cloud-upload" size={ 48 } />
						<h3>{ translate( 'Drag and drop' ) }</h3>
						<p>{ translate( 'Your files anywhere to upload, or {{span}}{{input/}}browse{{/span}}', {
							components: {
								span: <span className="media-library__upload-controls-file-anchor" />,
								input: <input
										className="media-library__upload-controls-file-input"
										type="file"
										accept={ this.getInputAccept() }
										multiple
										onChange={ this.uploadFiles }
										onClick={ this.onUploadClick } />
							} } ) }</p>
					</div>
				</div>
			</form>
		);
	}
};

MediaLibraryUploadControls.propTypes = {
	site: PropTypes.object.isRequired,
	onAddMedia: PropTypes.func.isRequired,
};

export default localize( MediaLibraryUploadControls );

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
import MediaLibraryUploadUrl from './upload-url';
import MediaUtils from 'lib/media/utils';
import SectionHeader from 'components/section-header';
import { userCan } from 'lib/site/utils';
import { VideoPressFileTypes } from 'lib/media/constants';

class MediaLibraryUploadControls extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			addingViaUrl: false,
		};
	}

	onAddUrlClick = () => {
		! this.state.addingViaUrl && this.setState( { addingViaUrl: true } );
	};

	onAddUrlClose = () => {
		this.setState( { addingViaUrl: false } );
	};

	uploadFiles = ( event ) => {
		if ( event.target.files && this.props.site ) {
			MediaActions.clearValidationErrors( this.props.site.ID );
			MediaActions.add( this.props.site.ID, event.target.files );
		}

		ReactDom.findDOMNode( this.refs.itemForm ).reset();
		ReactDom.findDOMNode( this.refs.dropzoneForm ).reset();
		this.props.onAddMedia();
		analytics.mc.bumpStat( 'editor_upload_via', 'add_button' );
	};

	onUploadClick = () => {
		if ( this.props.href ) {
			page( this.props.href );
		}
	};

	onExternalServiceClick = () => {
		this.props.onSourceChange( 'google_photos' );
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

	renderUploadViaUrl() {
		const { site, translate, onAddMedia } = this.props;

		if ( this.state.addingViaUrl ) {
			return (
				<CompactCard className="media-library__upload-controls-option">
					<MediaLibraryUploadUrl
						site={ site }
						onAddMedia={ onAddMedia }
						onClose={ this.onAddUrlClose } />
				</CompactCard>
			);
		}

		return (
			<CompactCard className="media-library__upload-controls-option" onClick={ this.onAddUrlClick }>
				<Gridicon icon="domains" size={ 18 } />
				<span className="media-library__upload-controls-option-name">{ translate( 'URL' ) }</span>
				<Gridicon icon="chevron-right" />
			</CompactCard>
		);
	}

	renderFileItem() {
		const { translate } = this.props;

		return (
			<form ref="itemForm">
				<CompactCard className="media-library__upload-controls-option">
					<Gridicon icon="computer" size={ 18 } />
					<span className="media-library__upload-controls-option-name">{ translate( 'Computer' ) }</span>
					<Gridicon icon="chevron-right" />
					<input
						className="media-library__upload-controls-file-input"
						type="file"
						accept={ this.getInputAccept() }
						multiple
						onChange={ this.uploadFiles }
						onClick={ this.onUploadClick } />
				</CompactCard>
			</form>
		);
	}

	renderDropzone() {
		const { translate } = this.props;

		return (
			<div className="media-library__upload-controls-drop-zone-container">
				<Gridicon icon="cloud-upload" size={ 48 } />
				<h3>{ translate( 'Drag and drop' ) }</h3>
				<form ref="dropzoneForm">
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
				</form>
			</div>
		);
	}

	render() {
		const { translate, site } = this.props;

		if ( ! userCan( 'upload_files', site ) ) {
			return null;
		}

		return (
			<div className="media-library__upload-controls-container">
				<div>
					<SectionHeader
						className="media-library__upload-controls-header"
						label={ translate( 'Upload from' ) } />
					<Card className="media-library__upload-controls-options">
						{ this.renderFileItem() }
						{ this.renderUploadViaUrl() }
						<CompactCard className="media-library__upload-controls-option" onClick={ this.onExternalServiceClick }>
							<SocialLogo icon="google" size={ 18 } />
							<span className="media-library__upload-controls-option-name">{ translate( 'Google Photos' ) }</span>
							<Gridicon icon="chevron-right" />
						</CompactCard>
					</Card>
				</div>
				{ this.renderDropzone() }
			</div>
		);
	}
}

MediaLibraryUploadControls.propTypes = {
	site: PropTypes.object.isRequired,
	onAddMedia: PropTypes.func.isRequired,
	onSourceChange: PropTypes.func.isRequired,
};

export default localize( MediaLibraryUploadControls );

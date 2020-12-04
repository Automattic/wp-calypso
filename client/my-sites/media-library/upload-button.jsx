/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { noop, uniq } from 'lodash';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import { bumpStat } from 'calypso/lib/analytics/mc';
import {
	getAllowedFileTypesForSite,
	isSiteAllowedFileTypesToBeTrusted,
} from 'calypso/lib/media/utils';
import { VideoPressFileTypes } from 'calypso/lib/media/constants';
import { clearMediaItemErrors } from 'calypso/state/media/actions';
import { addMedia } from 'calypso/state/media/thunks';

/**
 * Style dependencies
 */
import './upload-button.scss';

export class MediaLibraryUploadButton extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		onAddMedia: PropTypes.func,
		className: PropTypes.string,
		addMedia: PropTypes.func,
	};

	static defaultProps = {
		onAddMedia: noop,
		type: 'button',
		href: null,
	};

	formRef = React.createRef();

	onClick = () => {
		if ( this.props.onClick ) {
			this.props.onClick();
		}
		if ( this.props.href ) {
			page( this.props.href );
		}
	};

	uploadFiles = ( event ) => {
		if ( event.target.files && this.props.site ) {
			this.props.clearMediaItemErrors( this.props.site.ID );
			this.props.addMedia( event.target.files, this.props.site );
		}

		this.formRef.current.reset();
		this.props.onAddMedia();
		bumpStat( 'editor_upload_via', 'add_button' );
	};

	/**
	 * Returns a string of comma-separated file extensions supported for the
	 * current site, to be used as the `accept` attribute in an `input` element
	 * of type `file`. This is a non-standard use of the `accept` attribute,
	 * but is supported in Internet Explorer and Chrome browsers. Further input
	 * validation will occur when attempting to upload the file.
	 *
	 * @returns {string} Supported file extensions, as comma-separated string
	 */
	getInputAccept = () => {
		if ( ! isSiteAllowedFileTypesToBeTrusted( this.props.site ) ) {
			return null;
		}
		const allowedFileTypesForSite = getAllowedFileTypesForSite( this.props.site );

		return uniq( allowedFileTypesForSite.concat( VideoPressFileTypes ) )
			.map( ( type ) => `.${ type }` )
			.join();
	};

	render() {
		const classes = classNames( 'media-library__upload-button', 'button', this.props.className );

		return (
			<form ref={ this.formRef } className={ classes }>
				{ this.props.children }
				<input
					type="file"
					accept={ this.getInputAccept() }
					multiple
					onChange={ this.uploadFiles }
					onClick={ this.onClick }
					className="media-library__upload-button-input"
				/>
			</form>
		);
	}
}

export default connect( null, { addMedia, clearMediaItemErrors } )( MediaLibraryUploadButton );

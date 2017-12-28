/** @format */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React from 'react';
import { noop, uniq } from 'lodash';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'client/lib/analytics';
import MediaActions from 'client/lib/media/actions';
import MediaUtils from 'client/lib/media/utils';
import { VideoPressFileTypes } from 'client/lib/media/constants';

export default class extends React.Component {
	static displayName = 'MediaLibraryUploadButton';

	static propTypes = {
		site: PropTypes.object,
		onAddMedia: PropTypes.func,
		className: PropTypes.string,
	};

	static defaultProps = {
		onAddMedia: noop,
		type: 'button',
		href: null,
	};

	onClick = () => {
		if ( this.props.href ) {
			page( this.props.href );
		}
	};

	uploadFiles = event => {
		if ( event.target.files && this.props.site ) {
			MediaActions.clearValidationErrors( this.props.site.ID );
			MediaActions.add( this.props.site, event.target.files );
		}

		ReactDom.findDOMNode( this.refs.form ).reset();
		this.props.onAddMedia();
		analytics.mc.bumpStat( 'editor_upload_via', 'add_button' );
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

		return uniq( allowedFileTypesForSite.concat( VideoPressFileTypes ) )
			.map( type => `.${ type }` )
			.join();
	};

	render() {
		var classes = classNames( 'media-library__upload-button', 'button', this.props.className );

		return (
			<form ref="form" className={ classes }>
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

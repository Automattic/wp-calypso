/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isVideoPressItem, url } from 'lib/media/utils';
import EditorMediaModalDetailItemVideoPress from './detail-preview-videopress';
import MediaFile from 'my-sites/media-library/media-file';

export default class extends React.Component {
	static displayName = 'EditorMediaModalDetailPreviewVideo';

	static propTypes = {
		className: PropTypes.string,
		item: PropTypes.object.isRequired,
	};

	render() {
		if ( isVideoPressItem( this.props.item ) ) {
			return <EditorMediaModalDetailItemVideoPress { ...this.props } />;
		}

		const classes = classNames( this.props.className, 'is-video' );

		return (
			<MediaFile component="video" src={ url( this.props.item ) } controls className={ classes } />
		);
	}
}

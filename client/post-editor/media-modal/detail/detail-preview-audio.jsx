/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { url } from 'lib/media/utils';
import MediaFile from 'my-sites/media-library/media-file';

export default class extends React.Component {
	static displayName = 'EditorMediaModalDetailPreviewAudio';

	static propTypes = {
		className: PropTypes.string,
		item: PropTypes.object.isRequired,
	};

	render() {
		const classes = classNames( this.props.className, 'is-audio' );

		return (
			<MediaFile component="audio" src={ url( this.props.item ) } controls className={ classes } />
		);
	}
}

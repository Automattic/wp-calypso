/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isVideoPressItem } from 'calypso/lib/media/utils';
import EditorMediaModalDetailItemVideoPress from './detail-preview-videopress';
import EditorMediaModalDetailPreviewMediaFile from './detail-preview-media-file';

export default class extends React.Component {
	static displayName = 'EditorMediaModalDetailPreviewAudio';

	static propTypes = {
		className: PropTypes.string,
		item: PropTypes.object.isRequired,
		site: PropTypes.object.isRequired,
	};

	render() {
		if ( isVideoPressItem( this.props.item ) ) {
			return <EditorMediaModalDetailItemVideoPress { ...this.props } />;
		}

		const { className, ...props } = this.props;
		return (
			<EditorMediaModalDetailPreviewMediaFile
				component="video"
				className={ classNames( className, 'is-video' ) }
				{ ...props }
			/>
		);
	}
}

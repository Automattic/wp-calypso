/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import EditorMediaModalDetailPreviewMediaFile from './detail-preview-media-file';

export default class extends React.Component {
	static displayName = 'EditorMediaModalDetailPreviewAudio';

	static propTypes = {
		className: PropTypes.string,
		item: PropTypes.object.isRequired,
		site: PropTypes.object.isRequired,
	};

	render() {
		const { className, ...props } = this.props;
		return (
			<EditorMediaModalDetailPreviewMediaFile
				component="audio"
				className={ classNames( className, 'is-audio' ) }
				{ ...props }
			/>
		);
	}
}

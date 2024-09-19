import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import EditorMediaModalDetailPreviewMediaFile from './detail-preview-media-file';

export default class extends Component {
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
				className={ clsx( className, 'is-audio' ) }
				{ ...props }
			/>
		);
	}
}

import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { isVideoPressItem } from 'calypso/lib/media/utils';
import EditorMediaModalDetailPreviewMediaFile from './detail-preview-media-file';
import EditorMediaModalDetailItemVideoPress from './detail-preview-videopress';

export default class extends Component {
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

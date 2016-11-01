/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ImagePreloader from 'components/image-preloader';
import Spinner from 'components/spinner';
import MediaUtils from 'lib/media/utils';

export default React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewImage',

	propTypes: {
		site: PropTypes.object,
		item: PropTypes.object.isRequired,
		onLoad: PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			onLoad: noop
		};
	},

	render() {
		const src = MediaUtils.url( this.props.item, {
			photon: this.props.site && ! this.props.site.is_private
		} );

		const { item, onLoad } = this.props;
		const { alt, height, width, title } = item;

		return (
			<div>
				<img
					className="editor-media-modal-detail__preview is-image is-fake"
					src={ src }
					width={ width }
					height={ height } />
				<ImagePreloader
					src={ src }
					width={ width }
					height={ height }
					placeholder={ <Spinner /> }
					onLoad={ onLoad }
					alt={ alt || title }
					className="editor-media-modal-detail__preview is-image" />
			</div>
		);
	}
} );

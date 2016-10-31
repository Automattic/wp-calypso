/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ImagePreloader from 'components/image-preloader';
import Spinner from 'components/spinner';
import { url, isItemBeingUploaded } from 'lib/media/utils';

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
		const src = url( this.props.item, {
			photon: this.props.site && ! this.props.site.is_private
		} );

		const classes = classNames(
			'editor-media-modal-detail__preview',
			'is-image',
			{
				'is-loading': isItemBeingUploaded( this.props.item )
			}
		);
		return (
			<ImagePreloader
				src={ src }
				width={ this.props.item.width }
				height={ this.props.item.height }
				placeholder={ <Spinner /> }
				onLoad={ this.props.onLoad }
				alt={ this.props.item.alt || this.props.item.title }
				className={ classes } />
		);
	}
} );

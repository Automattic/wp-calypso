/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MediaUtils from 'lib/media/utils';
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'EditorFeaturedImagePreview',

	propTypes: {
		image: PropTypes.object,
		maxWidth: PropTypes.number
	},

	src: function() {
		return MediaUtils.url( this.props.image, {
			maxWidth: this.props.maxWidth,
			size: 'post-thumbnail'
		} );
	},

	render() {
		if ( ! this.props.image ) {
			return null;
		}

		const src = this.src();
		if ( ! src ) {
			return null;
		}

		const classes = classNames( 'image-selector__preview', {
			'is-transient': this.props.image.transient
		} );

		return (
			<div className={ classes }>
				<Spinner />
				<img src={ src } />
			</div>
		);
	}
} );

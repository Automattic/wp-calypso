/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { some } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { generateGalleryShortcode } from 'lib/media/utils';
import GalleryShortcode from 'components/gallery-shortcode';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryPreviewShortcode',

	propTypes: {
		siteId: PropTypes.number,
		settings: PropTypes.object
	},

	getInitialState() {
		return {
			isLoading: true,
			shortcode: generateGalleryShortcode( this.props.settings )
		};
	},

	componentWillReceiveProps( nextProps ) {
		const shortcode = generateGalleryShortcode( nextProps.settings );
		if ( this.state.shortcode === shortcode ) {
			return;
		}

		this.setState( {
			isLoading: true,
			shortcode
		} );
	},

	setLoaded() {
		if ( ! this.isMounted() ) {
			return;
		}

		this.setState( {
			isLoading: false
		} );
	},

	render() {
		const { siteId, settings } = this.props;
		const { isLoading, shortcode } = this.state;
		const classes = classNames( 'editor-media-modal-gallery__preview-shortcode', {
			'is-loading': isLoading || some( settings.items, 'transient' )
		} );

		return (
			<div className={ classes }>
				<GalleryShortcode siteId={ siteId } onLoad={ this.setLoaded }>
					{ shortcode }
				</GalleryShortcode>
			</div>
		);
	}

} );

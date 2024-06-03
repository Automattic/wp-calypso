import clsx from 'clsx';
import { some } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import GalleryShortcode from 'calypso/components/gallery-shortcode';
import { generateGalleryShortcode } from 'calypso/lib/media/utils';

export default class EditorMediaModalGalleryPreviewShortcode extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		settings: PropTypes.object,
	};

	state = {
		isLoading: true,
		shortcode: generateGalleryShortcode( this.props.settings ),
	};

	isMounted = false;

	static getDerivedStateFromProps( nextProps, prevState ) {
		const shortcode = generateGalleryShortcode( nextProps.settings );
		if ( prevState.shortcode === shortcode ) {
			return null;
		}

		return { isLoading: true, shortcode };
	}

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	setLoaded = () => {
		if ( ! this.isMounted ) {
			return;
		}

		this.setState( { isLoading: false } );
	};

	render() {
		const { siteId, settings } = this.props;
		const { isLoading, shortcode } = this.state;
		const classes = clsx( 'editor-media-modal-gallery__preview-shortcode', {
			'is-loading': isLoading || some( settings.items, 'transient' ),
		} );

		return (
			<div className={ classes }>
				<GalleryShortcode siteId={ siteId } onLoad={ this.setLoaded }>
					{ shortcode }
				</GalleryShortcode>
			</div>
		);
	}
}

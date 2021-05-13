/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ImagePreloader from 'calypso/components/image-preloader';
import MediaFile, { MediaFileProps } from './media-file';
import { RenderedComponent } from './proxied-image';

const MediaImage: React.FC< MediaFileProps > = function MediaImage( props: MediaFileProps ) {
	let component: RenderedComponent = props.component;
	if ( component === 'img' && props.placeholder ) {
		component = ImagePreloader;
	}

	return <MediaFile { ...props } component={ component } />;
};

MediaImage.defaultProps = {
	component: 'img',
	proxiedComponent: 'img',
};

export default MediaImage;

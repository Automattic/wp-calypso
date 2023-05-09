import ImagePreloader from 'calypso/components/image-preloader';
import MediaFile, { MediaFileProps } from './media-file';
import { RenderedComponent } from './proxied-image';

function MediaImage( props: MediaFileProps ) {
	const component: RenderedComponent = props.component;
	if ( component === 'img' && props.placeholder ) {
		return <MediaFile { ...props } component={ ImagePreloader } />;
	}

	return <MediaFile { ...props } component={ component } />;
}

MediaImage.defaultProps = {
	component: 'img',
	proxiedComponent: 'img',
};

export default MediaImage;

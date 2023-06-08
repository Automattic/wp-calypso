import ImagePreloader from 'calypso/components/image-preloader';
import MediaFile, { MediaFileProps } from './media-file';

function MediaImage( { component = 'img', proxiedComponent = 'img', ...props }: MediaFileProps ) {
	if ( component === 'img' && props.placeholder ) {
		return (
			<MediaFile { ...props } proxiedComponent={ proxiedComponent } component={ ImagePreloader } />
		);
	}

	return <MediaFile { ...props } proxiedComponent={ proxiedComponent } component={ component } />;
}

export default MediaImage;

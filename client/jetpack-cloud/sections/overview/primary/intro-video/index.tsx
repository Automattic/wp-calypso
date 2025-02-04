import { useTranslate } from 'i18n-calypso';
import VideoPressIframe from 'calypso/components/jetpack/videopress-iframe';

export default function IntroVideo() {
	const translate = useTranslate();

	const videoURL =
		'https://video.wordpress.com/embed/Z9piKY9s?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1%27';
	const title = translate( 'Jetpack Manage Overview' );

	return <VideoPressIframe videoURL={ videoURL } title={ title } />;
}

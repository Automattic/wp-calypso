import { useTranslate } from 'i18n-calypso';
import styles from './style.module.css';

export default function IntroVideo() {
	const translate = useTranslate();

	return (
		<iframe
			className={ styles[ 'intro-video' ] }
			title={ translate( 'Jetpack Manage Overview' ) }
			aria-label={ translate( 'Jetpack Manage Overview' ) }
			src={
				'https://video.wordpress.com/embed/Z9piKY9s?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1%27'
			}
			allowFullScreen
		></iframe>
	);
}

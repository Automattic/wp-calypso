import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import GetHelpNav from '../get-help-nav';
import QuickLinksNav from '../quick-links-nav';
import './style.scss';

export default function OverviewSidebar() {
	const translate = useTranslate();
	return (
		<>
			<section>
				<iframe
					className="intro-video"
					title={ translate( 'Jetpack Manage Overview' ) }
					aria-label={ translate( 'Jetpack Manage Overview' ) }
					src={
						'https://video.wordpress.com/embed/Z9piKY9s?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1%27'
					}
					allowFullScreen
				></iframe>
			</section>

			<section>
				<QuickLinksNav />
			</section>

			<section>
				<GetHelpNav />

				<Button
					href={ localizeUrl( 'https://jetpack.com/contact-support/' ) }
					className="contact-support-button"
					onClick={ () => {} }
				>
					{ translate( 'Contact support' ) }
				</Button>
			</section>
		</>
	);
}

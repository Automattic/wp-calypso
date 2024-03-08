import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import GetHelpNav from '../get-help-nav';
import IntroVideo from '../intro-video';
import QuickLinksNav from '../quick-links-nav';
import './style.scss';

export default function OverviewSidebar() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	return (
		<>
			<section>
				<IntroVideo />
			</section>

			<section>
				<QuickLinksNav />
			</section>

			<section>
				<GetHelpNav />
				<Button
					className="contact-support-button"
					href={ localizeUrl( 'https://jetpack.com/contact-support/' ) }
					onClick={ () =>
						dispatch(
							recordTracksEvent( 'calypso_jetpack_manage_overview_contact_support_button_click' )
						)
					}
					target="_blank"
				>
					{ translate( 'Contact support' ) }
				</Button>
			</section>
		</>
	);
}

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function OverviewSidebarContactSupport() {
	const translate = useTranslate();

	const dispatch = useDispatch();

	const toggleContactForm = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_contact_support_click' ) );
	};

	return (
		<Button
			className="overview__contact-support-button"
			onClick={ toggleContactForm }
			href={ CONTACT_URL_HASH_FRAGMENT }
		>
			{ translate( 'Contact sales & support' ) }
		</Button>
	);
}

import { useTranslate } from 'i18n-calypso';
import { SiteSettings } from 'calypso/landing/subscriptions/components/settings';

const SiteSubscriptionSettings = () => {
	const translate = useTranslate();

	return (
		<div className="site-subscription-settings">
			<h2 className="site-subscription-settings__heading">{ translate( 'Settings' ) }</h2>
			<SiteSettings />
		</div>
	);
};

export default SiteSubscriptionSettings;

import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSiteSlug } from 'calypso/state/sites/selectors';

export const PaidNewsletterSection = () => {
	const translate = useTranslate();
	const siteSlug = useSelectedSiteSelector( getSiteSlug );

	const onSetUpButtonClick = () => {
		recordTracksEvent( 'calypso_newsletter_settings_setup_payment_plans_button_click' );
	};

	return (
		<Card className="site-settings__card">
			<Button href={ `/earn/payments/${ siteSlug }` } onClick={ onSetUpButtonClick }>
				{ translate( 'Set up' ) }
			</Button>
			<FormSettingExplanation>
				{ translate(
					'Earn money through your Newsletter. Reward your most loyal subscribers with exclusive content or add a paywall to monetize content.'
				) }
			</FormSettingExplanation>
		</Card>
	);
};

import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { A4A_PARTNER_DIRECTORY_DASHBOARD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { StickyCard } from 'calypso/a8c-for-agencies/components/sticky-card';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { usePartnerDirectoryOnboardingCard } from './hooks/use-partner-directory-onboard-card';
import banner from './partner-directories-banner.jpg';

import './style.scss';

export default function PartnerDirectoryOnboardingCard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { isActive, hideCard } = usePartnerDirectoryOnboardingCard();

	if ( ! isActive ) {
		return null;
	}

	const onDismiss = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_partner_directory_onboarding_card_dismiss' ) );
		hideCard();
	};

	const onActivate = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_partner_directory_onboarding_card_activate' ) );
		hideCard();
		page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
	};

	return (
		<StickyCard
			className="partner-directory-onboarding-card"
			position="bottom right"
			title="Announcing partner directories"
			dismissable
			onClose={ onDismiss }
		>
			<div className="partner-director-onboarding-card__top">
				<img className="partner-director-onboarding-card__banner" src={ banner } alt="" />

				<div className="partner-directory-onboarding-card__content">
					<h1 className="partner-directory-onboarding-card__content-title">
						{ translate( 'Boost your agency’s visibility across Automattic platforms' ) }
					</h1>

					<p className="partner-directory-onboarding-card__content-description">
						{ translate(
							'Complete your agency profile on our platform to be featured in our partner directories.'
						) }
					</p>
				</div>
			</div>

			<div className="partner-directory-onboarding-card__footer">
				<Button
					className="partner-directoy-onboarding-card__dismiss-button"
					onClick={ onDismiss }
					plain
				>
					{ translate( 'Maybe later' ) }
				</Button>
				<Button
					className="partner-directoy-onboarding-card__activate-button"
					primary
					onClick={ onActivate }
				>
					{ translate( "Let's do it" ) }
				</Button>
			</div>
		</StickyCard>
	);
}

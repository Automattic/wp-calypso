import { useTranslate } from 'i18n-calypso';
import EmergingPartnerBackground from 'calypso/assets/images/a8c-for-agencies/agency-tier/announcement-background.svg';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import AgencyTierCelebrationModalContent from './celebration-modal-content';

const PREFERENCE_NAME = 'a4a-agency-tier-announcement-modal-dismissed';

const AgencyTierFeatureAnnouncement = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const announcementShown = useSelector( ( state ) => getPreference( state, PREFERENCE_NAME ) );

	const isDismissed = announcementShown?.dismiss;

	const handleSavePreference = () => {
		// Save the preference to prevent the modal from showing again
		dispatch( savePreference( PREFERENCE_NAME, { dismiss: true } ) );
	};

	const handleOnClose = () => {
		handleSavePreference();
		dispatch( recordTracksEvent( 'calypso_a8c_agency_tier_announcement_modal_dismiss' ) );
	};

	const handleClickExploreBenefits = () => {
		handleSavePreference();
		dispatch( recordTracksEvent( 'calypso_a8c_agency_tier_announcement_modal_cta_click' ) );
	};

	if ( isDismissed ) {
		return null;
	}

	return (
		<AgencyTierCelebrationModalContent
			celebrationModal={ {
				title: translate( "We've just launched Agency Tiers in beta!" ),
				description: translate(
					"We're granting you early access to our new Agency Tier experience! While the official launch of our tiers is set for January 2025, you can explore and progress on your tier today."
				),
				video:
					'https://automattic.com/wp-content/uploads/2024/11/agency_tiers_feature_announcement.mp4',
				image: EmergingPartnerBackground,
				cta: translate( 'Learn more' ),
			} }
			handleOnClose={ handleOnClose }
			handleClickExploreBenefits={ handleClickExploreBenefits }
			currentAgencyTier="announcement-modal"
		/>
	);
};

export default AgencyTierFeatureAnnouncement;

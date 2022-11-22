import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import type { Step } from '../../types';
import type { Design } from '@automattic/design-picker/src/types';

const DesignCarousel: Step = function DesignCarousel( { navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();

	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
	const { setThemeOnSite, installTheme } = useDispatch( SITE_STORE );
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteId || siteSlug;
	const isJetpackSite = useSelect( ( select ) => select( SITE_STORE ).isJetpackSite( site?.ID ) );

	function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );
		if ( siteSlugOrId && _selectedDesign ) {
			setPendingAction( async () => {
				if ( isJetpackSite ) {
					try {
						await installTheme( siteSlugOrId, _selectedDesign.slug );
					} catch ( e ) {
						// TODO: Handle better theme already installed
					}
				}

				await setThemeOnSite( siteSlugOrId, _selectedDesign.slug ).then( () =>
					reduxDispatch( requestActiveTheme( site?.ID || -1 ) )
				);
				return { selectedDesign: _selectedDesign, siteSlug };
			} );
			submit?.();
		}
	}

	return (
		<StepContainer
			stepName="designCarousel"
			goBack={ goBack }
			goNext={ goNext }
			shouldHideNavButtons
			isFullLayout={ true }
			stepContent={
				<AsyncLoad
					require="@automattic/design-carousel"
					placeholder={ null }
					onPick={ pickDesign }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					id="seller-step-header"
					headerText={ __( 'Choose a design to start' ) }
					subHeaderText={ __(
						"Don't worry, you can change or customize this at any time in the future."
					) }
					align="center"
				/>
			}
		/>
	);
};

export default DesignCarousel;

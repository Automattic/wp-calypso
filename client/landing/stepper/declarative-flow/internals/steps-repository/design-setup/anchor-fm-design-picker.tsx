import DesignPicker from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { useNewSiteVisibility } from 'calypso/landing/gutenboarding/hooks/use-selected-plan';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../../../../stores';
import { ANCHOR_FM_THEMES } from './anchor-fm-themes';
import { STEP_NAME } from './constants';
import type { Step } from '../../types';
import './style.scss';
import type { Design } from '@automattic/design-picker';

const AnchorFmDesignPicker: Step = ( { navigation, flow } ) => {
	const { goBack, submit, goToStep } = navigation;
	const translate = useTranslate();
	const locale = useLocale();
	const reduxDispatch = useReduxDispatch();
	const { setPendingAction, createSite } = useDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const { anchorPodcastId, anchorEpisodeId, anchorSpotifyUrl } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);

	const visibility = useNewSiteVisibility();

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );

	const pickDesign = ( _selectedDesign: Design | undefined = selectedDesign ) => {
		if ( ! _selectedDesign ) {
			return;
		}

		setPendingAction( async () => {
			if ( ! currentUser && ! newUser ) {
				return;
			}

			let user = '';
			if ( currentUser ) {
				user = currentUser.username;
			} else if ( newUser ) {
				user = newUser.username as string;
			}

			await createSite( {
				username: user,
				languageSlug: locale,
				bearerToken: undefined,
				visibility,
				anchorFmPodcastId: anchorPodcastId,
				anchorFmEpisodeId: anchorEpisodeId,
				anchorFmSpotifyUrl: anchorSpotifyUrl,
			} );

			const newSite = getNewSite();

			if ( ! newSite || ! newSite.site_slug ) {
				return;
			}

			return setDesignOnSite( newSite.site_slug, _selectedDesign ).then( () =>
				reduxDispatch( requestActiveTheme( newSite.blogid ) )
			);
		} );

		recordTracksEvent( 'calypso_signup_design_type_submit', {
			flow,
			intent: 'anchor-fm',
			design_type: _selectedDesign.design_type,
		} );

		submit?.();
	};

	useEffect( () => {
		if ( ! currentUser && ! newUser ) {
			//Go to login
			goToStep?.( 'login' );
		}
	}, [ currentUser, newUser ] );

	return (
		<StepContainer
			stepName={ STEP_NAME }
			hideSkip
			skipButtonAlign={ 'top' }
			hideFormattedHeader
			backLabelText={ 'Back' }
			stepContent={
				<DesignPicker
					designs={ ANCHOR_FM_THEMES as Design[] }
					theme={ 'light' }
					locale={ locale }
					onSelect={ pickDesign }
					isGridMinimal
					highResThumbnails
					hideFullScreenPreview
					recommendedCategorySlug={ null }
					anchorHeading={
						<FormattedHeader
							className="anchor-fm-design-picker__header"
							id={ 'step-header' }
							headerText={ translate( 'Choose a design' ) }
							subHeaderText={ translate(
								'Pick a homepage layout for your podcast site. You can customize or change it later.'
							) }
							align="left"
						/>
					}
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			goNext={ () => submit?.() }
			goBack={ goBack }
		/>
	);
};

export default AnchorFmDesignPicker;

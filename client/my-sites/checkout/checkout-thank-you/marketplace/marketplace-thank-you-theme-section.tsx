import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Gridicon, Button } from '@automattic/components';
import { DesignPreviewImage, isDefaultGlobalStylesVariationSlug } from '@automattic/design-picker';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import ActivationModal from 'calypso/my-sites/themes/activation-modal';
import { useSelector, useDispatch } from 'calypso/state';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import { activate } from 'calypso/state/themes/actions';
import {
	getThemePreviewThemeOptions,
	hasActivatedTheme,
	isThemeActive,
	isActivatingTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useIsValidThankYouTheme from './use-is-valid-thank-you-theme';

const ThemeSectionImageContainer = styled.div`
	margin: 8px 8px 0 8px;
	border-radius: 16px;
	box-shadow:
		0px 15px 20px rgba( 0, 0, 0, 0.04 ),
		0px 13px 10px rgba( 0, 0, 0, 0.03 ),
		0px 6px 6px rgba( 0, 0, 0, 0.02 );
	width: 100%;
`;

const ThemeSectionMShotsContainer = styled.div`
	border-radius: 13px;
	margin-bottom: 8px;
	position: relative;
	overflow: hidden;
	padding-top: 74%;
	width: 100%;
`;

const ThemeSectionImage = styled.img`
	border-radius: 13px;
	width: 100%;
`;

export const ThankYouThemeSection = ( {
	theme,
	isOnboardingFlow,
	continueWithPluginBundle,
}: {
	theme: any;
	isOnboardingFlow: boolean;
	continueWithPluginBundle: boolean | null;
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isActive = useSelector( ( state ) => isThemeActive( state, theme.id, siteId ) );
	const { data: activeThemeData, isLoading } = useActiveThemeQuery( siteId, true );
	const isFSEActive = activeThemeData?.[ 0 ]?.is_block_theme ?? false;
	const hasActivated = useSelector( ( state ) => hasActivatedTheme( state, siteId ) );
	const isActivating = useSelector( ( state ) => isActivatingTheme( state, siteId ) );
	const customizeUrl = useSelector( ( state ) =>
		getCustomizeUrl( state, theme.id, siteId, isFSEActive )
	);
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) ) ?? undefined;
	const themeOptions = useSelector( getThemePreviewThemeOptions );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const themeStyleVariation =
		themeOptions && themeOptions.themeId === theme.id ? themeOptions.styleVariation : undefined;

	const isValidThankyouSectionTheme = useIsValidThankYouTheme( theme, siteId );

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				theme: theme.id,
			} );
		},
		[ siteId, theme ]
	);

	useEffect( () => {
		if ( isActive && continueWithPluginBundle ) {
			page( `/setup/plugin-bundle/getCurrentThemeSoftwareSets?siteSlug=${ siteSlug }` );
		}
	}, [ isActive, continueWithPluginBundle, siteSlug ] );

	const handleActivateTheme = useCallback( () => {
		if ( isActive ) {
			return;
		}
		sendTrackEvent( 'calypso_theme_thank_you_activate_theme_click' );
		dispatch(
			activate( theme.id, siteId, 'marketplace-thank-you', false, false, isOnboardingFlow )
		);
	}, [ theme.id, siteId, isOnboardingFlow, dispatch, isActive, sendTrackEvent ] );

	useEffect( () => {
		if ( isOnboardingFlow ) {
			handleActivateTheme();
		}
	}, [ isOnboardingFlow, handleActivateTheme ] );

	return (
		<>
			<QueryActiveTheme siteId={ siteId } />
			<ActivationModal source="details" />
			<ThankYouProduct
				key={ `theme_information_${ theme.id }` }
				name={ theme.name }
				details={
					theme.author ? translate( 'by %(author)s', { args: { author: theme.author } } ) : null
				}
				actions={
					<>
						<Button
							variant="primary"
							busy={ ( isActivating && ! hasActivated ) || isLoading }
							onClick={ handleActivateTheme }
							href={ isActive ? customizeUrl : undefined }
							disabled={ ! isValidThankyouSectionTheme }
						>
							{ isActive
								? translate( 'Customize this design' )
								: translate( 'Activate this design' ) }
						</Button>

						{ isActive ? (
							<Button
								variant="secondary"
								href={ siteUrl }
								disabled={ ! isValidThankyouSectionTheme }
							>
								<Gridicon size={ 18 } icon="external" />
								{ translate( 'View site' ) }
							</Button>
						) : null }
					</>
				}
				preview={
					<ThemeSectionImageContainer>
						{ ! isDefaultGlobalStylesVariationSlug( themeStyleVariation?.slug ) ? (
							<ThemeSectionMShotsContainer>
								<DesignPreviewImage
									design={ {
										...theme,
										slug: theme.id,
										recipe: { stylesheet: theme.stylesheet },
									} }
									styleVariation={ themeStyleVariation }
								/>
							</ThemeSectionMShotsContainer>
						) : (
							<ThemeSectionImage
								src={ theme.screenshot }
								alt={
									translate( "%(theme)s's icon", {
										args: {
											theme: theme.name,
										},
									} ) as string
								}
							/>
						) }
					</ThemeSectionImageContainer>
				}
			/>
		</>
	);
};

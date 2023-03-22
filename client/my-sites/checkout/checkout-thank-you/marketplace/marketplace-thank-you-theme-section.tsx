import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import { activate } from 'calypso/state/themes/actions';
import { isThemeActive, hasActivatedTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ThemeSectionContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 720px;
	box-sizing: border-box;

	@media ( max-width: 740px ) {
		width: 500px;
	}

	@media ( max-width: 520px ) {
		width: 280px;
	}
`;

const ThemeSectionImageContainer = styled.div`
	padding: 8px 8px 0 8px;
	border-radius: 16px;
	box-shadow: 0px 15px 20px rgba( 0, 0, 0, 0.04 ), 0px 13px 10px rgba( 0, 0, 0, 0.03 ),
		0px 6px 6px rgba( 0, 0, 0, 0.02 );
`;

const ThemeSectionImage = styled.img`
	border-radius: 13px;
`;

const ThemeSectionContent = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;
	padding-top: 26px;
`;

const ThemeSectionName = styled.div`
	font-size: 16px;
	font-weight: 500;
	line-height: 24px;
	color: var( --studio-gray-100 );
	& small {
		font-size: 14px;
		line-height: 22px;
		font-weight: 400;
		color: var( --studio-gray-60 );
	}
`;

const ThemeSectionButtons = styled.div`
	display: flex;
	gap: 16px;
	flex-wrap: wrap;

	& a {
		flex-grow: 1;
		justify-content: center;
	}

	.gridicon.gridicons-external {
		margin-right: 4px;
	}
`;

const ThemeButton = styled( Button )`
	border-radius: 4px;
`;

export const ThankYouThemeSection = ( { theme }: { theme: any } ) => {
	const [ isActivating, setIsActivating ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isActive = useSelector( ( state ) => isThemeActive( state, theme.id, siteId ) );
	const { data, isLoading } = useActiveThemeQuery( siteId, true );
	const hasActivated = useSelector( ( state ) => hasActivatedTheme( state, siteId ) );
	const isFSEActive = data?.[ 0 ]?.theme_supports[ 'block-templates' ] ?? false;
	const customizeUrl = useSelector( ( state ) =>
		getCustomizeUrl( state, theme.id, siteId, isFSEActive )
	);
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) ) ?? undefined;

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				theme: theme.id,
			} );
		},
		[ siteId, theme ]
	);

	const handleActivateTheme = () => {
		if ( isActive ) {
			return;
		}
		sendTrackEvent( 'calypso_theme_thank_you_activate_theme_click' );
		dispatch( activate( theme.id, siteId, 'marketplace-thank-you' ) );
		setIsActivating( true );
	};

	return (
		<ThemeSectionContainer>
			<AutoLoadingHomepageModal source="details" />
			<ThemeSectionImageContainer>
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
			</ThemeSectionImageContainer>
			<ThemeSectionContent>
				<ThemeSectionName>
					<h5>{ theme.name }</h5>
					<small>
						{ theme.author
							? translate( 'by %(author)s', { args: { author: theme.author } } )
							: null }
					</small>
				</ThemeSectionName>
				<ThemeSectionButtons>
					<ThemeButton
						isPrimary
						isBusy={ ( isActivating && ! hasActivated ) || isLoading }
						onClick={ handleActivateTheme }
						href={ isActive ? customizeUrl : undefined }
					>
						{ isActive
							? translate( 'Customize this design' )
							: translate( 'Activate this design' ) }
					</ThemeButton>

					{ isActive ? (
						<ThemeButton isSecondary href={ siteUrl }>
							<Gridicon size={ 18 } icon="external" />
							{ translate( 'View site' ) }
						</ThemeButton>
					) : null }
				</ThemeSectionButtons>
			</ThemeSectionContent>
		</ThemeSectionContainer>
	);
};

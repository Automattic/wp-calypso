import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AutoLoadingHomepageModal from 'calypso/my-sites/themes/auto-loading-homepage-modal';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { activate } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ThemeSectionContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 720px;
	box-sizing: border-box;
	border-radius: 16px;

	box-shadow: 0px 15px 20px rgba( 0, 0, 0, 0.04 ), 0px 13px 10px rgba( 0, 0, 0, 0.03 ),
		0px 6px 6px rgba( 0, 0, 0, 0.02 );

	@media ( max-width: 740px ) {
		width: 500px;
	}

	@media ( max-width: 520px ) {
		width: 280px;
	}
`;

const ThemeSectionImage = styled.img`
	padding: 8px 8px 0 8px;
	border-radius: 13px;
`;

const ThemeSectionContent = styled.div`
	padding: 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
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
	min-width: auto;
`;

export const ThankYouThemeSection = ( { theme }: { theme: any } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

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
		sendTrackEvent( 'calypso_theme_thank_you_activate_theme_click' );
		dispatch( activate( theme.id, Number( siteId ), 'marketplace-thank-you' ) );
	};

	return (
		<ThemeSectionContainer>
			<AutoLoadingHomepageModal source="details" />
			<ThanksModal source="details" themeId={ theme.id } />
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
					<Button isPrimary onClick={ handleActivateTheme }>
						{ translate( 'Theme details' ) }
					</Button>
				</ThemeSectionButtons>
			</ThemeSectionContent>
		</ThemeSectionContainer>
	);
};

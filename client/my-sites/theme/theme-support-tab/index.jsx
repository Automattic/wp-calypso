import { Card, Gridicon } from '@automattic/components';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import useSupportDocData from 'calypso/components/inline-support-link/use-support-doc-data';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';

import './style.scss';

export default function ThemeSupportTab( { themeId } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isLoggedIn = useSelector( isUserLoggedIn );
	const { setNavigateToOdie, setShowHelpCenter, setNavigateToRoute } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const themeTier = useThemeTierForTheme( themeId );
	const { openSupportDoc } = useSupportDocData( { supportContext: 'themes-unsupported' } );

	return (
		<>
			<Card className="theme__sheet-card-support">
				<Gridicon icon="play" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ translate( 'Learn WordPress' ) }
					<small>
						{ translate(
							'Follow along with beginner-friendly courses and build your first website or blog.'
						) }
					</small>
				</div>
				<Button
					__next40pxDefaultSize
					href={ localizeUrl( 'https://wordpress.com/support/courses' ) }
					onClick={ () =>
						dispatch(
							recordTracksEvent( 'calypso_theme_sheet_button_click', {
								theme_name: themeId,
								button_context: 'courses',
							} )
						)
					}
					rel="noreferrer"
					target="_blank"
					variant="secondary"
				>
					{ translate( 'Watch a course' ) }
				</Button>
			</Card>

			{ isLoggedIn && (
				<>
					<Card className="theme__sheet-card-support">
						<Gridicon icon="help-outline" size={ 48 } />
						<div className="theme__sheet-card-support-details">
							{ translate( 'Discover comprehensive guides' ) }
							<small>
								{ translate( 'Explore deep-dive tutorials for every WordPress.com feature.' ) }
							</small>
						</div>
						<Button
							__next40pxDefaultSize
							onClick={ () => {
								setShowHelpCenter( true );
								setNavigateToRoute( '/' );
								dispatch(
									recordTracksEvent( 'calypso_theme_sheet_button_click', {
										theme_name: themeId,
										button_context: 'help-center',
									} )
								);
							} }
							variant="secondary"
						>
							{ translate( 'Visit guides' ) }
						</Button>
					</Card>

					{ themeTier?.slug === 'community' || themeTier?.slug === 'partner' ? (
						<Card className="theme__sheet-card-support">
							<Gridicon icon="notice-outline" size={ 48 } />
							<div className="theme__sheet-card-support-details">
								{ translate( 'Help and support for this theme is not offered by WordPress.com.' ) }
								<small>
									{ translate( 'Contact the theme developer directly for help with this theme.' ) }
								</small>
							</div>
							<Button
								__next40pxDefaultSize
								onClick={ () => {
									openSupportDoc();
									dispatch(
										recordTracksEvent( 'calypso_theme_sheet_button_click', {
											theme_name: themeId,
											button_context: 'themes-unsupported',
										} )
									);
								} }
								variant="secondary"
							>
								{ translate( 'Learn more' ) }
							</Button>
						</Card>
					) : (
						<Card className="theme__sheet-card-support">
							<Gridicon icon="comment" size={ 48 } />
							<div className="theme__sheet-card-support-details">
								{ translate( 'Contact support' ) }
								<small>
									{ translate(
										'Get answers from our AI assistant, with access to 24/7 expert human support on paid plans.'
									) }
								</small>
							</div>
							<Button
								__next40pxDefaultSize
								onClick={ () => {
									setNavigateToOdie();
									dispatch(
										recordTracksEvent( 'calypso_theme_sheet_button_click', {
											theme_name: themeId,
											button_context: 'help-center-ai',
										} )
									);
								} }
								variant="secondary"
							>
								{ translate( 'Get in touch' ) }
							</Button>
						</Card>
					) }
				</>
			) }
		</>
	);
}

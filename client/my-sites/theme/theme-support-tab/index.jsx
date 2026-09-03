import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { Button } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import EmotionCacheProvider from 'calypso/components/emotion-cache-provider';
import useSupportDocData from 'calypso/components/inline-support-link/use-support-doc-data';
import ActionList from 'calypso/dashboard/components/action-list';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';

export default function ThemeSupportTab( { themeId } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isLoggedIn = useSelector( isUserLoggedIn );
	const { setNavigateToOdie, setShowHelpCenter, setNavigateToRoute } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const themeTier = useThemeTierForTheme( themeId );
	const { openSupportDoc } = useSupportDocData( { supportContext: 'themes-unsupported' } );

	return (
		<EmotionCacheProvider>
			<ActionList>
				<ActionList.ActionItem
					title={ translate( 'Learn WordPress' ) }
					description={ translate(
						'Follow along with beginner-friendly courses and build your first website or blog.'
					) }
					actions={
						<Button
							nativeButton={ false }
							render={
								<a
									href={ localizeUrl( 'https://wordpress.com/support/courses' ) }
									rel="noreferrer"
									target="_blank"
								/>
							}
							onClick={ () =>
								dispatch(
									recordTracksEvent( 'calypso_theme_sheet_button_click', {
										theme_name: themeId,
										button_context: 'courses',
									} )
								)
							}
							size="compact"
							variant="outline"
						>
							{ translate( 'Watch a course' ) }
						</Button>
					}
				/>
				{ isLoggedIn && (
					<ActionList.ActionItem
						title={ translate( 'Discover comprehensive guides' ) }
						description={ translate(
							'Explore deep-dive tutorials for every WordPress.com feature.'
						) }
						actions={
							<Button
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
								size="compact"
								variant="outline"
							>
								{ translate( 'Visit guides' ) }
							</Button>
						}
					/>
				) }
				{ isLoggedIn &&
					( themeTier?.slug === 'community' ? (
						<ActionList.ActionItem
							title={ translate(
								'Help and support for this theme is not offered by WordPress.com.'
							) }
							description={ translate(
								'Contact the theme developer directly for help with this theme.'
							) }
							actions={
								<Button
									onClick={ () => {
										openSupportDoc();
										dispatch(
											recordTracksEvent( 'calypso_theme_sheet_button_click', {
												theme_name: themeId,
												button_context: 'themes-unsupported',
											} )
										);
									} }
									size="compact"
									variant="outline"
								>
									{ translate( 'Learn more' ) }
								</Button>
							}
						/>
					) : (
						<ActionList.ActionItem
							title={ translate( 'Contact support' ) }
							description={ translate(
								'Get answers from our AI assistant, with access to 24/7 expert human support on paid plans.'
							) }
							actions={
								<Button
									onClick={ () => {
										setNavigateToOdie();
										dispatch(
											recordTracksEvent( 'calypso_theme_sheet_button_click', {
												theme_name: themeId,
												button_context: 'help-center-ai',
											} )
										);
									} }
									size="compact"
									variant="outline"
								>
									{ translate( 'Get in touch' ) }
								</Button>
							}
						/>
					) ) }
			</ActionList>
		</EmotionCacheProvider>
	);
}

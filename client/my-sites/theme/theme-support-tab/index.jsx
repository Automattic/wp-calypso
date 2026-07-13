import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
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
		<ActionList>
			<ActionList.ActionItem
				title={ translate( 'Learn WordPress' ) }
				description={ translate(
					'Follow along with beginner-friendly courses and build your first website or blog.'
				) }
				actions={
					<Button
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
						size="compact"
						variant="secondary"
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
							variant="secondary"
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
								variant="secondary"
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
								variant="secondary"
							>
								{ translate( 'Get in touch' ) }
							</Button>
						}
					/>
				) ) }
		</ActionList>
	);
}

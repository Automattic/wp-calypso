/**
 * WordPress dependencies
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useContext } from '@wordpress/element';
import { isRTL, __, sprintf } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { store as editSiteStore } from '../../store';
import { isPreviewingTheme, currentlyPreviewingTheme } from '../../utils/is-previewing-theme';
import { SidebarNavigationContext } from '../sidebar';
import SidebarButton from '../sidebar-button';

const { useHistory, useLocation } = unlock( routerPrivateApis );

export default function SidebarNavigationScreen( {
	isRoot,
	title,
	actions,
	content,
	footer,
	description,
	backPath: backPathProp,
} ) {
	const { dashboardLink, dashboardLinkText, previewingThemeName } = useSelect( ( select ) => {
		const { getSettings } = unlock( select( editSiteStore ) );
		const currentlyPreviewingThemeId = currentlyPreviewingTheme();
		return {
			dashboardLink: getSettings().__experimentalDashboardLink,
			dashboardLinkText: getSettings().__experimentalDashboardLinkText,
			// Do not call `getTheme` with null, it will cause a request to
			// the server.
			previewingThemeName: currentlyPreviewingThemeId
				? select( coreStore ).getTheme( currentlyPreviewingThemeId )?.name?.rendered
				: undefined,
		};
	}, [] );
	const location = useLocation();
	const history = useHistory();
	const { navigate } = useContext( SidebarNavigationContext );
	const backPath = backPathProp ?? location.state?.backPath;
	const icon = isRTL() ? chevronRight : chevronLeft;

	return (
		<>
			<VStack
				className={ clsx( 'edit-site-sidebar-navigation-screen__main', {
					'has-footer': !! footer,
				} ) }
				spacing={ 0 }
				justify="flex-start"
			>
				<HStack
					spacing={ 3 }
					alignment="flex-start"
					className="edit-site-sidebar-navigation-screen__title-icon"
				>
					{ ! isRoot && (
						<SidebarButton
							onClick={ () => {
								history.navigate( backPath );
								navigate( 'back' );
							} }
							icon={ icon }
							label={ __( 'Back' ) }
							showTooltip={ false }
						/>
					) }
					{ isRoot && (
						<SidebarButton
							icon={ icon }
							label={ dashboardLinkText || __( 'Go to the Dashboard' ) }
							href={ dashboardLink }
						/>
					) }
					<Heading
						className="edit-site-sidebar-navigation-screen__title"
						color={ '#e0e0e0' /* $gray-200 */ }
						level={ 1 }
						size={ 20 }
					>
						{ ! isPreviewingTheme()
							? title
							: sprintf(
									/* translators: 1: theme name. 2: title */
									__( 'Previewing %1$s: %2$s' ),
									previewingThemeName,
									title
							  ) }
					</Heading>
					{ actions && (
						<div className="edit-site-sidebar-navigation-screen__actions">{ actions }</div>
					) }
				</HStack>
				<div className="edit-site-sidebar-navigation-screen__content">
					{ description && (
						<div className="edit-site-sidebar-navigation-screen__description">{ description }</div>
					) }
					{ content }
				</div>
			</VStack>
			{ footer && (
				<footer className="edit-site-sidebar-navigation-screen__footer">{ footer }</footer>
			) }
		</>
	);
}

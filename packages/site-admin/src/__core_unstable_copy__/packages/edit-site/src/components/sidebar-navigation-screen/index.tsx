/**
 * External dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,

	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHeading as Heading,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { store as editSiteStore } from '@wordpress/edit-site';
import { useContext } from '@wordpress/element';
import { isRTL, __ } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../../debug';
import { useHistory, useLocation } from '../../../../router/src';
import { SidebarNavigationContext } from '../sidebar';
import SidebarButton from '../sidebar-button';
import './style.scss'; // @Todo: different from core: not imported in this way

// import { privateApis as routerPrivateApis } from '@wordpress/router';
// import { store as coreStore } from '@wordpress/core-data';
// import {
// 	isPreviewingTheme,
// 	currentlyPreviewingTheme,
// } from '../../utils/is-previewing-theme';
// import { unlock } from '../../lock-unlock';

// const { useHistory, useLocation } = unlock( routerPrivateApis );

type SidebarNavigationScreenProps = {
	isRoot: boolean;
	title: string;
	actions?: React.ReactNode;
	meta?: React.ReactNode;
	content: React.ReactNode;
	footer?: React.ReactNode;
	description?: string;
	backPath?: string;
};

export default function SidebarNavigationScreen( {
	isRoot,
	title,
	actions,
	meta,
	content,
	footer,
	description,
	backPath: backPathProp,
}: SidebarNavigationScreenProps ) {
	unstableResourceWarning(
		'<SidebarNavigationScreen />',
		'https://github.com/WordPress/gutenberg/blob/56883338749aa23acc75481c3bbc605bf1cb5a81/packages/edit-site/src/components/sidebar-navigation-screen/index.js#L35'
	);

	// previewingThemeName
	const { dashboardLink, dashboardLinkText } = useSelect( ( select ) => {
		const { getSettings } = select( editSiteStore );
		// const currentlyPreviewingThemeId = currentlyPreviewingTheme();
		return {
			dashboardLink: getSettings().__experimentalDashboardLink,
			dashboardLinkText: getSettings().__experimentalDashboardLinkText,

			// Do not call `getTheme` with null, it will cause a request to
			// the server.
			// previewingThemeName: currentlyPreviewingThemeId
			// 	? select( coreStore ).getTheme( currentlyPreviewingThemeId )
			// 			?.name?.rendered
			// 	: undefined,
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
							label={ __( 'Back', 'woocommerce-analytics' ) }
							showTooltip={ false }
						/>
					) }
					{ isRoot && (
						<SidebarButton
							icon={ icon }
							label={ dashboardLinkText || __( 'Go to the Dashboard', 'woocommerce-analytics' ) }
							href={ dashboardLink }
						/>
					) }
					<Heading
						className="edit-site-sidebar-navigation-screen__title"
						color={ '#e0e0e0' /* $gray-200 */ }
						level={ 1 }
						size={ 20 }
					>
						{ title }
						{
							// ! isPreviewingTheme()
							// 	? title
							// 	: sprintf(
							// 			/* translators: 1: theme name. 2: title */
							// 			__(
							// 				'Previewing %1$s: %2$s',
							// 				'woocommerce-analytics'
							// 			),
							// 			previewingThemeName,
							// 			title
							// 	  )
						 }
					</Heading>
					{ actions && (
						<div className="edit-site-sidebar-navigation-screen__actions">{ actions }</div>
					) }
				</HStack>
				{ meta && (
					<>
						<div className="edit-site-sidebar-navigation-screen__meta">{ meta }</div>
					</>
				) }

				<div className="edit-site-sidebar-navigation-screen__content">
					{ description && (
						<p className="edit-site-sidebar-navigation-screen__description">{ description }</p>
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

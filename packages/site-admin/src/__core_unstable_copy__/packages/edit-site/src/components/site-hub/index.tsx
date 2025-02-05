/**
 * External dependencies
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { store as commandsStore } from '@wordpress/commands';
import {
	Button,
	VisuallyHidden,

	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { store as editSiteStore } from '@wordpress/edit-site';
import { memo, forwardRef, useContext } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { displayShortcut } from '@wordpress/keycodes';
import { filterURLForDisplay } from '@wordpress/url';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../../debug';
import { useHistory } from '../../../../router/src';
import { SidebarNavigationContext } from '../sidebar';
import SiteIcon from '../site-icon';
import './style.scss'; // @Todo: different from core: not imported in this way

interface SiteData {
	title: string;
	url: string;
}

const SiteHub = memo(
	forwardRef( ( { isTransparent }: { isTransparent: boolean }, ref ) => {
		unstableResourceWarning(
			'<SiteHub />',
			'https://github.com/WordPress/gutenberg/blob/9f7d7dc52bb1ac42043f93a1e8bd243eddd5aa97/packages/edit-site/src/components/site-hub/index.js#L34'
		);

		const { dashboardLink, homeUrl, siteTitle } = useSelect( ( select ) => {
			const { getSettings } = select( editSiteStore );

			const { getEntityRecord } = select( coreStore );

			// @todo: @unstable: TS fix -> SiteData should be defined
			const _site = getEntityRecord( 'root', 'site' ) as SiteData;

			// @todo: @unstable: TS fix -> home should be string
			const home = select( coreStore ).getEntityRecord< {
				home: string;
			} >( 'root', '__unstableBase' )?.home;

			return {
				dashboardLink: getSettings().__experimentalDashboardLink,
				homeUrl: home,
				siteTitle:
					! _site?.title && !! _site?.url ? filterURLForDisplay( _site?.url ) : _site?.title,
			};
		}, [] );
		const { open: openCommandCenter } = useDispatch( commandsStore );

		return (
			<div className="edit-site-site-hub">
				<HStack justify="flex-start" spacing="0">
					<div
						className={ clsx( 'edit-site-site-hub__view-mode-toggle-container', {
							'has-transparent-background': isTransparent,
						} ) }
					>
						<Button
							__next40pxDefaultSize
							ref={ ref }
							href={ dashboardLink }
							label={ __( 'Go to the Dashboard' ) }
							className="edit-site-layout__view-mode-toggle"
							style={ {
								transform: 'scale(0.5333) translateX(-4px)', // Offset to position the icon 12px from viewport edge
								borderRadius: 4,
							} }
						>
							<SiteIcon className="edit-site-layout__view-mode-toggle-icon" />
						</Button>
					</div>

					<HStack>
						<div className="edit-site-site-hub__title">
							<Button __next40pxDefaultSize variant="link" href={ homeUrl } target="_blank">
								{ decodeEntities( siteTitle ) }
								<VisuallyHidden as="span">
									{
										/* translators: accessibility text */
										__( '(opens in a new tab)' )
									}
								</VisuallyHidden>
							</Button>
						</div>
						<HStack spacing={ 0 } expanded={ false } className="edit-site-site-hub__actions">
							<Button
								size="compact"
								// eslint-disable-next-line wpcalypso/jsx-classname-namespace
								className="edit-site-site-hub_toggle-command-center"
								icon={ search }
								onClick={ () => openCommandCenter() }
								label={ __( 'Open command palette' ) }
								shortcut={ displayShortcut.primary( 'k' ) }
							/>
						</HStack>
					</HStack>
				</HStack>
			</div>
		);
	} )
);

export default SiteHub;

// @unstable: declare SiteHubMobileProps type (not present in core)
type SiteHubMobileProps = {
	isTransparent: boolean;
	backPath?: string; // @unstable: `backPath` prop (not present in core)
};

export const SiteHubMobile = memo(
	forwardRef( ( { isTransparent, backPath = '/' }: SiteHubMobileProps, ref ) => {
		unstableResourceWarning(
			'<SiteHubMobile />',
			'https://github.com/WordPress/gutenberg/blob/c2d2d692e09c624bd693355822eaa23f670f84b7/packages/edit-site/src/components/site-hub/index.js#L118'
		);
		const history = useHistory();
		const { navigate } = useContext( SidebarNavigationContext );

		const { dashboardLink, isBlockTheme, homeUrl, siteTitle } = useSelect( ( select ) => {
			const { getSettings } = select( editSiteStore );
			const { getEntityRecord, getCurrentTheme } = select( coreStore );

			const _site = getEntityRecord( 'root', 'site' ) as SiteData;

			// @todo: @unstable: TS fix -> home should be string
			const home = select( coreStore ).getEntityRecord< {
				home: string;
			} >( 'root', '__unstableBase' )?.home;

			return {
				dashboardLink: getSettings().__experimentalDashboardLink,
				isBlockTheme: getCurrentTheme()?.is_block_theme,
				homeUrl: home,
				siteTitle:
					! _site?.title && !! _site?.url ? filterURLForDisplay( _site?.url ) : _site?.title,
			};
		}, [] );
		const { open: openCommandCenter } = useDispatch( commandsStore );

		return (
			<div className="edit-site-site-hub">
				<HStack justify="flex-start" spacing="0">
					<div
						className={ clsx( 'edit-site-site-hub__view-mode-toggle-container', {
							'has-transparent-background': isTransparent,
						} ) }
					>
						<Button
							__next40pxDefaultSize
							ref={ ref }
							className="edit-site-layout__view-mode-toggle"
							style={ {
								transform: 'scale(0.5)',
								borderRadius: 4,
							} }
							{ ...( ! isBlockTheme
								? {
										href: dashboardLink,
										label: __( 'Go to the Dashboard' ),
								  }
								: {
										onClick: () => {
											history.navigate( backPath ); // @unstable: `backPath` prop (not present in core)
											navigate( 'back' );
										},
										label: __( 'Go to Site Editor' ),
								  } ) }
						>
							<SiteIcon className="edit-site-layout__view-mode-toggle-icon" />
						</Button>
					</div>

					<HStack>
						<div className="edit-site-site-hub__title">
							<Button
								__next40pxDefaultSize
								variant="link"
								href={ homeUrl }
								target="_blank"
								label={ __( 'View site (opens in a new tab)' ) }
							>
								{ decodeEntities( siteTitle ) }
							</Button>
						</div>
						<HStack spacing={ 0 } expanded={ false } className="edit-site-site-hub__actions">
							<Button
								__next40pxDefaultSize
								// eslint-disable-next-line wpcalypso/jsx-classname-namespace
								className="edit-site-site-hub_toggle-command-center"
								icon={ search }
								onClick={ () => openCommandCenter() }
								label={ __( 'Open command palette' ) }
								shortcut={ displayShortcut.primary( 'k' ) }
							/>
						</HStack>
					</HStack>
				</HStack>
			</div>
		);
	} )
);

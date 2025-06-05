/**
 * External dependencies
 */
import { store as commandsStore } from '@wordpress/commands';
import { Button, VisuallyHidden, __experimentalHStack as HStack } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { memo, forwardRef } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { displayShortcut } from '@wordpress/keycodes';
import { filterURLForDisplay } from '@wordpress/url';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { SiteIcon } from '../';
import './style.scss';
/**
 * Types
 */
import type { JSX } from 'react';

interface SiteData {
	title: string;
	url: string;
	show_on_front?: string;
	page_on_front?: string | number;
	page_for_posts?: string | number;
}

interface SiteHubProps {
	isTransparent: boolean;
	exitLabel: string;
	exitLink: string;
}

/**
 * SiteHub Component
 *
 * Provides a top-level navigation element displaying the site title,
 * a back navigation button, and access to the command palette.
 * It integrates with WordPress Core's entity data
 * to fetch site information dynamically.
 * @param {SiteHubProps} props - The component props.
 * @returns {JSX.Element} The rendered SiteHub component.
 */
export const SiteHub = memo(
	forwardRef(
		(
			{
				isTransparent,
				exitLink = '/',
				exitLabel = __( 'Go to the Dashboard', 'a8c-site-admin' ),
			}: SiteHubProps,
			ref
		): JSX.Element => {
			const { homeUrl, siteTitle } = useSelect( ( select ) => {
				const { getEntityRecord } = select( coreStore );

				const _site = getEntityRecord( 'root', 'site' ) as SiteData;
				const home = getEntityRecord< {
					home: string;
				} >( 'root', '__unstableBase' )?.home;

				return {
					homeUrl: home,
					siteTitle:
						! _site?.title && !! _site?.url ? filterURLForDisplay( _site?.url ) : _site?.title,
				};
			}, [] );

			const { open: openCommandCenter } = useDispatch( commandsStore );

			return (
				<div className="site-admin-site-hub">
					<HStack justify="flex-start" spacing="0">
						<div
							className={ clsx( 'site-admin-site-hub__view-mode-toggle-container', {
								'has-transparent-background': isTransparent,
							} ) }
						>
							<Button
								className="site-admin-layout__view-mode-toggle"
								__next40pxDefaultSize
								ref={ ref }
								href={ exitLink }
								label={ exitLabel }
							>
								<SiteIcon className="site-admin-layout__view-mode-toggle-icon" />
							</Button>
						</div>

						<HStack>
							<div className="site-admin-site-hub__title">
								<Button
									className="site-admin-site-hub__title-button"
									__next40pxDefaultSize
									variant="link"
									href={ homeUrl }
									target="_blank"
								>
									{ decodeEntities( siteTitle ) }
									<VisuallyHidden as="span">
										{
											/* translators: accessibility text */
											__( '(opens in a new tab)', 'a8c-site-admin' )
										}
									</VisuallyHidden>
								</Button>
							</div>

							<HStack spacing={ 0 } expanded={ false } className="site-admin-site-hub__actions">
								<Button
									size="compact"
									className="site-admin-site-hub__toggle-command-center"
									icon={ search }
									onClick={ () => openCommandCenter() }
									label={ __( 'Open command palette', 'a8c-site-admin' ) }
									shortcut={ displayShortcut.primary( 'k' ) }
								/>
							</HStack>
						</HStack>
					</HStack>
				</div>
			);
		}
	)
);

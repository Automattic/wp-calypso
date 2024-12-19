import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { WordPressLogo, JetpackLogo } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useContext, useCallback } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
	A4A_SITES_LINK,
	A4A_SITES_LINK_NEEDS_SETUP,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchDevLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-licenses';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import usePaymentMethod from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/hooks/use-payment-method';
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import AddNewSiteContext from 'calypso/components/add-new-site/context';
import AddNewSiteMenuItem from 'calypso/components/add-new-site/menu-item';
import AddNewSitePopoverColumn from 'calypso/components/add-new-site/popover-column';
import { preventWidows } from 'calypso/lib/formatting';
import type { AddNewSiteMenuItemsProps } from 'calypso/components/add-new-site/types';

type PendingSite = { features: { wpcom_atomic: { state: string; license_key: string } } };

const AddNewSiteA4AMenuItems = ( { setMenuVisible }: AddNewSiteMenuItemsProps ) => {
	const translate = useTranslate();

	const { setVisibleModalType } = useContext( AddNewSiteContext );

	const pressableOwnership = usePressableOwnershipType();

	const { data: pendingSites } = useFetchPendingSites();
	const { data: devLicenses } = useFetchDevLicenses();
	const { paymentMethodRequired } = usePaymentMethod();

	const allAvailableSites =
		pendingSites?.filter(
			( { features }: PendingSite ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		) ?? [];

	const hasPendingWPCOMSites = allAvailableSites.length > 0;

	const availableDevSites = devLicenses?.available;
	const hasAvailableDevSites = devLicenses?.available > 0;

	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );

	const handleOnClick = useCallback(
		( modalType: string ) => {
			setVisibleModalType( modalType );
			setMenuVisible( false );
		},
		[ setVisibleModalType, setMenuVisible ]
	);

	return (
		<>
			<AddNewSitePopoverColumn heading={ translate( 'Import existing sites' ) }>
				<AddNewSiteMenuItem
					icon={ <WordPressLogo /> }
					heading={ translate( 'Via WordPress.com connection' ) }
					description={ preventWidows(
						translate( 'Import connected WordPress.com or Jetpack sites' )
					) }
					buttonProps={ {
						onClick: () => {
							handleOnClick( 'import-from-wpcom' );
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <A4ALogo /> }
					heading={ translate( 'Via the Automattic plugin' ) }
					description={ preventWidows(
						translate( 'Connect with the Automattic for Agencies plugin' )
					) }
					buttonProps={ {
						onClick: () => {
							handleOnClick( 'a4a-connection' );
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <JetpackLogo /> }
					heading={ translate( 'Via the Jetpack plugin' ) }
					description={ preventWidows(
						translate( 'Install the Jetpack plugin on an existing site' )
					) }
					buttonProps={ {
						onClick: () => {
							handleOnClick( 'jetpack-connection' );
						},
					} }
				/>
			</AddNewSitePopoverColumn>
			<AddNewSitePopoverColumn heading={ translate( 'Add a new production site' ) }>
				<AddNewSiteMenuItem
					icon={ <img src={ pressableIcon } alt="Pressable" /> }
					heading="Pressable"
					description={ translate( 'Bring your theme, plugins, and content to WordPress.com.' ) }
					buttonProps={ {
						href:
							pressableOwnership === 'regular'
								? 'https://my.pressable.com/agency/auth'
								: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
						target: pressableOwnership === 'regular' ? '_blank' : undefined,
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <WordPressLogo /> }
					heading="WordPress.com"
					description={ preventWidows(
						translate( 'Use a backup file to import your content into a new site.' )
					) }
					buttonProps={ {
						href: hasPendingWPCOMSites
							? A4A_SITES_LINK_NEEDS_SETUP
							: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
					} }
				>
					{ hasPendingWPCOMSites ? (
						<div className="add-new-site-popover__count">
							{ translate( '%(pendingSites)d site available', '%(pendingSites)d sites available', {
								args: {
									pendingSites: allAvailableSites.length,
								},
								count: allAvailableSites.length,
								comment: '%(pendingSites)s is the number of sites available.',
							} ) }
						</div>
					) : undefined }
				</AddNewSiteMenuItem>
			</AddNewSitePopoverColumn>
			{ devSitesEnabled && (
				<AddNewSitePopoverColumn>
					<AddNewSiteMenuItem
						isBanner
						icon={ <img src={ devSiteBanner } alt="Start building for free" /> }
						heading={ translate( 'Start building for free' ) }
						description={ preventWidows(
							translate(
								'Develop WordPress.com sites for as long as you need, with free development sites. Only pay when you launch!'
							)
						) }
						disabled={ ! hasAvailableDevSites }
						buttonProps={ {
							onClick: () => {
								if ( ! hasAvailableDevSites ) {
									return;
								}
								if ( paymentMethodRequired ) {
									page(
										`${ A4A_PAYMENT_METHODS_ADD_LINK }?return=${ A4A_SITES_LINK }?add_new_dev_site=true`
									);
								} else {
									setVisibleModalType( 'dev-site-configurations' );
								}
								setMenuVisible( false );
							},
						} }
					>
						<div>
							<div className="add-new-site-popover__count">
								{ translate( '%(pendingSites)d of 5 free licenses available', {
									args: {
										pendingSites: availableDevSites,
									},
									comment: '%(pendingSites)s is the number of free licenses available.',
								} ) }
							</div>
							<div
								className={ clsx( 'add-new-site-popover__cta', {
									disabled: ! hasAvailableDevSites,
								} ) }
							>
								{ translate( 'Create a site now →' ) }
							</div>
						</div>
					</AddNewSiteMenuItem>
				</AddNewSitePopoverColumn>
			) }
		</>
	);
};

export default AddNewSiteA4AMenuItems;

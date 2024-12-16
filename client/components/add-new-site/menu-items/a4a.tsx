import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { WordPressLogo, JetpackLogo } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
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
import { preventWidows } from 'calypso/lib/formatting';
import { AddNewSiteContext } from '../context';
import AddNewSiteMenuItem from '../menu-item';
import AddNewSitePopoverColumn from '../popover-column';

type PendingSite = { features: { wpcom_atomic: { state: string; license_key: string } } };

export interface AddNewSiteA4AMenuItemsProps {
	setMenuVisible: ( isVisible: boolean ) => void;
}

const AddNewSiteA4AMenuItems = ( { setMenuVisible }: AddNewSiteA4AMenuItemsProps ) => {
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

	return (
		<>
			<AddNewSitePopoverColumn heading={ translate( 'Add existing sites' ) }>
				<AddNewSiteMenuItem
					icon={ <A4ALogo /> }
					heading={ translate( 'Via the Automattic plugin' ) }
					description={ preventWidows(
						translate( 'Connect with the Automattic for Agencies plugin' )
					) }
					buttonProps={ {
						onClick: () => {
							setVisibleModalType( 'a4a-connection' );
							setMenuVisible( false );
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <WordPressLogo /> }
					heading={ translate( 'Via WordPress.com' ) }
					description={ preventWidows(
						translate( 'Add sites already connected to WordPress.com' )
					) }
					buttonProps={ {
						onClick: () => {
							setVisibleModalType( 'import-from-wpcom' );
							setMenuVisible( false );
						},
					} }
				/>
				<AddNewSiteMenuItem
					icon={ <JetpackLogo /> }
					heading={ translate( 'Via Jetpack' ) }
					description={ preventWidows(
						translate( 'Add a site by remotely installing the Jetpack plugin' )
					) }
					buttonProps={ {
						onClick: () => {
							setVisibleModalType( 'jetpack-connection' );
							setMenuVisible( false );
						},
					} }
				/>
			</AddNewSitePopoverColumn>
			<AddNewSitePopoverColumn heading={ translate( 'Add new sites' ) }>
				<AddNewSiteMenuItem
					icon={ <WordPressLogo /> }
					heading={ translate( 'WordPress.com' ) }
					description={ preventWidows(
						translate( 'Optimized and hassle-free hosting for business websites' )
					) }
					buttonProps={ {
						href: hasPendingWPCOMSites
							? A4A_SITES_LINK_NEEDS_SETUP
							: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
					} }
					extraContent={
						hasPendingWPCOMSites ? (
							<div className="add-new-site-popover__count">
								{ translate(
									'%(pendingSites)d site available',
									'%(pendingSites)d sites available',
									{
										args: {
											pendingSites: allAvailableSites.length,
										},
										count: allAvailableSites.length,
										comment: '%(pendingSites)s is the number of sites available.',
									}
								) }
							</div>
						) : undefined
					}
				/>
				<AddNewSiteMenuItem
					icon={ <img src={ pressableIcon } alt="Pressable" /> }
					heading={ translate( 'Pressable' ) }
					description={ translate( 'Best for large-scale businesses and major eCommerce sites' ) }
					buttonProps={ {
						href:
							pressableOwnership === 'regular'
								? 'https://my.pressable.com/agency/auth'
								: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
						target: pressableOwnership === 'regular' ? '_blank' : '_self',
					} }
				/>
			</AddNewSitePopoverColumn>
			{ devSitesEnabled && (
				<AddNewSitePopoverColumn>
					<AddNewSiteMenuItem
						isBanner
						icon={ <img src={ devSiteBanner } alt="Start Building for Free" /> }
						heading={ translate( 'Start Building for Free' ) }
						description={ preventWidows(
							translate(
								'Develop up to 5 WordPress.com sites at{{nbsp/}}once with free development licenses.{{br/}}Only pay when you launch!',
								{
									components: { br: <br />, nbsp: <>&nbsp;</> },
									comment: 'br is a line break, nbsp is a non-breaking space character',
								}
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
									// toggleDevSiteConfigurationsModal?.();
								}
								setMenuVisible( false );
							},
						} }
						extraContent={
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
						}
					/>
				</AddNewSitePopoverColumn>
			) }
		</>
	);
};

export default AddNewSiteA4AMenuItems;

import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Popover, Gridicon, Button, WordPressLogo, JetpackLogo } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import useFetchDevLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-licenses';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview-v3/hooks/use-pressable-ownership-type';
import usePaymentMethod from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/hooks/use-payment-method';
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4ALogo from '../a4a-logo';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
	A4A_SITES_LINK,
	A4A_SITES_LINK_NEEDS_SETUP,
} from '../sidebar-menu/lib/constants';
import A4AConnectionModal from './a4a-connection-modal';
import ImportFromWPCOMModal from './import-from-wpcom-modal';
import JetpackConnectionModal from './jetpack-connection-modal';

import './style.scss';

const ICON_SIZE = 32;

type PendingSite = { features: { wpcom_atomic: { state: string; license_key: string } } };

type Props = {
	onWPCOMImport?: ( blogIds: number[] ) => void;
	showMainButtonLabel: boolean;
	toggleDevSiteConfigurationsModal?: () => void;
};

export default function AddNewSiteButton( {
	showMainButtonLabel,
	onWPCOMImport,
	toggleDevSiteConfigurationsModal,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { paymentMethodRequired } = usePaymentMethod();

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ showA4AConnectionModal, setShowA4AConnectionModal ] = useState( false );
	const [ showJetpackConnectionModal, setShowJetpackConnectionModal ] = useState( false );
	const [ showImportFromWPCOMModal, setShowImportFromWPCOMModal ] = useState( false );

	const toggleMenu = () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	};

	const handleImportFromWPCOM = () => {
		dispatch( recordTracksEvent( 'calypso_a8c_agency_sites_import_wpcom_click' ) );
		setShowImportFromWPCOMModal( true );
		setMenuVisible( false );
	};

	const popoverMenuContext = useRef( null );

	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );

	const menuItem = ( {
		icon,
		iconClassName,
		heading,
		description,
		isBanner,
		disabled,
		buttonProps,
		extraContent,
	}: {
		icon: JSX.Element;
		iconClassName?: string;
		heading: string;
		description: string | TranslateResult;
		isBanner?: boolean;
		disabled?: boolean;
		buttonProps?: React.ComponentProps< typeof Button >;
		extraContent?: JSX.Element;
	} ) => {
		return (
			<Button
				{ ...buttonProps }
				className={ clsx( 'site-selector-and-importer__popover-button', {
					banner: isBanner,
					disabled,
				} ) }
				borderless
			>
				<div className={ clsx( 'site-selector-and-importer__popover-button-icon', iconClassName ) }>
					<Icon className="sidebar__menu-icon" icon={ icon } size={ ICON_SIZE } />
				</div>
				<div className="site-selector-and-importer__popover-button-content">
					<div className="site-selector-and-importer__popover-button-heading">{ heading }</div>
					<div className="site-selector-and-importer__popover-button-description">
						{ description }
					</div>
					{ extraContent }
				</div>
			</Button>
		);
	};

	const pressableOwnership = usePressableOwnershipType();

	const { data: pendingSites } = useFetchPendingSites();
	const { data: devLicenses } = useFetchDevLicenses();

	const allAvailableSites =
		pendingSites?.filter(
			( { features }: PendingSite ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		) ?? [];

	const hasPendingWPCOMSites = allAvailableSites.length > 0;

	const availableDevSites = devLicenses?.available;
	const hasAvailableDevSites = devLicenses?.available > 0;

	const popoverContent = (
		<div className="site-selector-and-importer__popover-content">
			<div className="site-selector-and-importer__popover-column">
				<div className="site-selector-and-importer__popover-column-heading">
					{ translate( 'Add existing sites' ).toUpperCase() }
				</div>
				{ menuItem( {
					icon: <A4ALogo />,
					heading: translate( 'Via the Automattic plugin' ),
					description: preventWidows(
						translate( 'Connect with the Automattic for Agencies plugin' )
					),
					buttonProps: {
						onClick: () => {
							setShowA4AConnectionModal( true );
							setMenuVisible( false );
						},
					},
				} ) }
				{ menuItem( {
					icon: <WordPressLogo />,
					heading: translate( 'Via WordPress.com' ),
					description: preventWidows( translate( 'Add sites already connected to WordPress.com' ) ),
					buttonProps: {
						onClick: handleImportFromWPCOM,
					},
				} ) }
				{ menuItem( {
					icon: <JetpackLogo />,
					heading: translate( 'Via Jetpack' ),
					description: preventWidows(
						translate( 'Add a site by remotely installing the Jetpack plugin' )
					),
					buttonProps: {
						onClick: () => {
							setShowJetpackConnectionModal( true );
							setMenuVisible( false );
						},
					},
				} ) }
			</div>
			<div className="site-selector-and-importer__popover-column">
				<div className="site-selector-and-importer__popover-column-heading">
					{ translate( 'Add a new site' ).toUpperCase() }
				</div>
				{ menuItem( {
					icon: <WordPressLogo />,
					heading: translate( 'WordPress.com' ),
					description: translate( 'Optimized and hassle-free hosting for business websites' ),
					buttonProps: {
						href: hasPendingWPCOMSites
							? A4A_SITES_LINK_NEEDS_SETUP
							: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
					},
					extraContent: hasPendingWPCOMSites ? (
						<div className="site-selector-and-importer__popover-site-count">
							{ translate( '%(pendingSites)d site available', '%(pendingSites)d sites available', {
								args: {
									pendingSites: allAvailableSites.length,
								},
								count: allAvailableSites.length,
								comment: '%(pendingSites)s is the number of sites available.',
							} ) }
						</div>
					) : undefined,
				} ) }
				{ menuItem( {
					icon: <img src={ pressableIcon } alt="" />,
					heading: translate( 'Pressable' ),
					description: translate( 'Best for large-scale businesses and major eCommerce sites' ),
					buttonProps: {
						href:
							pressableOwnership === 'regular'
								? 'https://my.pressable.com/agency/auth'
								: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
						target: pressableOwnership === 'regular' ? '_blank' : '_self',
					},
				} ) }
			</div>
			{ devSitesEnabled && (
				<div className="site-selector-and-importer__popover-column">
					{ menuItem( {
						icon: <img src={ devSiteBanner } alt="Start Building for Free" />,
						heading: translate( 'Start Building for Free' ),
						description: translate(
							'Develop up to 5 WordPress.com sites at{{nbsp/}}once with free development licenses.{{br/}}Only pay when you launch!',
							{
								components: { br: <br />, nbsp: <>&nbsp;</> },
								comment: 'br is a line break, nbsp is a non-breaking space character',
							}
						),
						disabled: ! hasAvailableDevSites,
						isBanner: true,
						buttonProps: {
							onClick: () => {
								if ( ! hasAvailableDevSites ) {
									return;
								}

								if ( paymentMethodRequired ) {
									page(
										`${ A4A_PAYMENT_METHODS_ADD_LINK }?return=${ A4A_SITES_LINK }?add_new_dev_site=true`
									);
								} else {
									toggleDevSiteConfigurationsModal?.();
								}
								setMenuVisible( false );
							},
						},
						extraContent: (
							<div>
								<div className="site-selector-and-importer__popover-site-count">
									{ translate( '%(pendingSites)d of 5 free licenses available', {
										args: {
											pendingSites: availableDevSites,
										},
										comment: '%(pendingSites)s is the number of free licenses available.',
									} ) }
								</div>
								<div
									className={ clsx( 'site-selector-and-importer__popover-development-site-cta', {
										disabled: ! hasAvailableDevSites,
									} ) }
								>
									{ translate( 'Create a site now →' ) }
								</div>
							</div>
						),
					} ) }
				</div>
			) }
		</div>
	);

	return (
		<>
			<Button
				className="site-selector-and-importer__button"
				ref={ popoverMenuContext }
				onClick={ toggleMenu }
			>
				{ showMainButtonLabel ? translate( 'Add sites' ) : null }
				<Gridicon
					className={ clsx(
						{ reverse: showMainButtonLabel && isMenuVisible },
						{ mobile: ! showMainButtonLabel }
					) }
					icon={ showMainButtonLabel ? 'chevron-down' : 'plus' }
				/>
			</Button>
			<Popover
				className={ clsx( 'site-selector-and-importer__popover', {
					'dev-sites-enabled': devSitesEnabled,
				} ) }
				context={ popoverMenuContext?.current }
				isVisible={ isMenuVisible }
				closeOnEsc
				onClose={ toggleMenu }
				autoPosition={ false }
				position="bottom left"
			>
				{ popoverContent }
			</Popover>

			{ showA4AConnectionModal && (
				<A4AConnectionModal onClose={ () => setShowA4AConnectionModal( false ) } />
			) }

			{ showJetpackConnectionModal && (
				<JetpackConnectionModal onClose={ () => setShowJetpackConnectionModal( false ) } />
			) }

			{ showImportFromWPCOMModal && (
				<ImportFromWPCOMModal
					onClose={ () => setShowImportFromWPCOMModal( false ) }
					onImport={ onWPCOMImport }
				/>
			) }
		</>
	);
}

import { Popover, Gridicon, Button, WordPressLogo, JetpackLogo } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4ALogo from '../a4a-logo';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
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
};

export default function SiteSelectorAndImporter( { showMainButtonLabel, onWPCOMImport }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

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

	const menuItem = ( {
		icon,
		iconClassName,
		heading,
		description,
		buttonProps,
		extraContent,
	}: {
		icon: JSX.Element;
		iconClassName?: string;
		heading: string;
		description: string;
		buttonProps?: React.ComponentProps< typeof Button >;
		extraContent?: JSX.Element;
	} ) => {
		return (
			<Button { ...buttonProps } className="site-selector-and-importer__popover-button" borderless>
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

	const chevronIcon = isMenuVisible ? 'chevron-up' : 'chevron-down';

	const pressableOwnership = usePressableOwnershipType();

	const { data: pendingSites } = useFetchPendingSites();

	const allAvailableSites =
		pendingSites?.filter(
			( { features }: PendingSite ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		) ?? [];

	const hasPendingWPCOMSites = allAvailableSites.length > 0;

	return (
		<>
			<Button
				className="site-selector-and-importer__button"
				ref={ popoverMenuContext }
				onClick={ toggleMenu }
			>
				{ showMainButtonLabel ? translate( 'Add sites' ) : null }
				<Gridicon icon={ showMainButtonLabel ? chevronIcon : 'plus' } />
			</Button>
			<Popover
				className="site-selector-and-importer__popover"
				context={ popoverMenuContext?.current }
				position="bottom right"
				isVisible={ isMenuVisible }
				closeOnEsc
				onClose={ toggleMenu }
			>
				<div className="site-selector-and-importer__popover-content">
					<div className="site-selector-and-importer__popover-column">
						<div className="site-selector-and-importer__popover-column-heading">
							{ translate( 'Import existing sites' ).toUpperCase() }
						</div>
						{ menuItem( {
							icon: <WordPressLogo />,
							heading: translate( 'Via WordPress.com' ),
							description: translate( 'Import sites bought on WordPress.com' ),
							buttonProps: {
								onClick: handleImportFromWPCOM,
							},
						} ) }
						{ menuItem( {
							icon: <A4ALogo />,
							heading: translate( 'Via the Automattic plugin' ),
							description: translate( 'Connect with the Automattic for Agencies plugin' ),
							buttonProps: {
								onClick: () => {
									setShowA4AConnectionModal( true );
									setMenuVisible( false );
								},
							},
						} ) }
						{ menuItem( {
							icon: <JetpackLogo />,
							heading: translate( 'Via Jetpack' ),
							description: translate( 'Import one or more Jetpack connected sites' ),
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
							description: translate( 'Best for large-scale businesses and major eCommerce sites' ),
							buttonProps: {
								href: hasPendingWPCOMSites
									? A4A_SITES_LINK_NEEDS_SETUP
									: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
							},
							extraContent: hasPendingWPCOMSites ? (
								<div className="site-selector-and-importer__popover-site-count">
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
							) : undefined,
						} ) }
						{ menuItem( {
							icon: <img src={ pressableIcon } alt="" />,
							heading: translate( 'Pressable' ),
							description: translate( 'Optimized and hassle-free hosting for business websites' ),
							buttonProps: {
								href:
									pressableOwnership === 'regular'
										? 'https://my.pressable.com/agency/auth'
										: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
								target: pressableOwnership === 'regular' ? '_blank' : '_self',
							},
						} ) }
					</div>
				</div>
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

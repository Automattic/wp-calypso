import {
	activeAgencyQuery,
	agencyDevLicensesQuery,
	agencyPendingSitesQuery,
} from '@automattic/api-queries';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useQuery } from '@tanstack/react-query';
import { useLinkProps } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useAnalytics } from '../../../app/analytics';
import Column from '../../../sites/add-new-site/column';
import MenuItem from '../../../sites/add-new-site/menu-item';
import { getMarketplaceHostingSectionRoute } from '../../marketplace/paths';
import A4ALogo from './a4a-logo';
import DevSiteCard from './dev-site-card';
import { getAvailablePendingSites, getPressableOwnershipType, isAgencyApproved } from './lib';
import type { AddNewSiteAction, AddNewSiteProps } from './types';
// The shared Column and MenuItem above are styled by the dotcom menu's stylesheet.
import '../../../sites/add-new-site/style.scss';

const EXTERNAL_PRESSABLE_AUTH_URL = 'https://my.pressable.com/agency/auth';

/**
 * `useLinkProps` describes a bare anchor: it widens `children` past the single
 * element MenuItem takes, and makes `href` optional because it drops it for a
 * disabled link. These links are never disabled, so a missing href is a bug.
 */
function toMenuItemProps( { children, href, ...rest }: ReturnType< typeof useLinkProps > ) {
	if ( ! href ) {
		throw new Error( 'Router link resolved without an href' );
	}
	return { ...rest, href };
}

function AddNewSite( { onSelectAction }: AddNewSiteProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: pendingSites } = useQuery( {
		...agencyPendingSitesQuery( agencyId ),
		enabled: !! agencyId,
	} );
	const { data: devLicenses } = useQuery( {
		...agencyDevLicensesQuery( agencyId ),
		enabled: !! agencyId,
	} );

	const availablePendingSites = getAvailablePendingSites( pendingSites );
	const hasPendingSites = availablePendingSites.length > 0;
	const pressableOwnership = getPressableOwnershipType( agency );
	const ownsPressableDirectly = pressableOwnership === 'regular';

	const isDesktop = useViewportMatch( 'medium' );
	const Wrapper = isDesktop ? HStack : VStack;

	const recordNavigation = ( action: string ) => {
		recordTracksEvent( 'calypso_dashboard_agency_sites_new_site_action_click_item', { action } );
	};

	// Both entries below change destination once the agency loads. Keeping one
	// MenuItem and swapping only its props avoids remounting the element, which
	// Google Translate breaks.
	const pressableMarketplaceProps = useLinkProps( {
		to: getMarketplaceHostingSectionRoute( 'pressable' ),
		onClick: () => recordNavigation( 'pressable' ),
	} );
	const wpcomMarketplaceProps = useLinkProps( {
		to: getMarketplaceHostingSectionRoute( 'wpcom' ),
		onClick: () => recordNavigation( 'wpcom' ),
	} );
	// Licenses already paid for are set up from Purchases, filtered down to the
	// ones with no site yet.
	const wpcomPendingLicensesProps = useLinkProps( {
		to: '/marketplace/purchases',
		search: { status: 'unassigned', search: 'WordPress.com' },
		onClick: () => recordNavigation( 'wpcom' ),
	} );

	const selectAction = ( action: AddNewSiteAction ) => {
		recordNavigation( action );
		onSelectAction( action );
	};

	return (
		<Wrapper alignment="flex-start" spacing={ 6 }>
			<Column title={ __( 'Import existing sites' ) }>
				<MenuItem
					icon={ <WordPressLogo /> }
					title={ __( 'Via WordPress.com connection' ) }
					description={ __( 'Import connected WordPress.com or Jetpack sites.' ) }
					onClick={ () => selectAction( 'import-from-wpcom' ) }
				/>
				<MenuItem
					icon={ <A4ALogo /> }
					title={ __( 'Via the Automattic plugin' ) }
					description={ __( 'Connect with the Automattic for Agencies plugin.' ) }
					onClick={ () => selectAction( 'a4a-connection' ) }
				/>
				<MenuItem
					icon={ <JetpackLogo /> }
					title={ __( 'Via the Jetpack plugin' ) }
					description={ __( 'Install the Jetpack plugin on an existing site.' ) }
					onClick={ () => selectAction( 'jetpack-connection' ) }
				/>
			</Column>
			<Column title={ __( 'Add a new production site' ) }>
				<MenuItem
					icon={ <img src={ pressableIcon } alt="" width={ 24 } /> }
					title="Pressable"
					description={ __( 'Best for large-scale businesses and major eCommerce sites.' ) }
					{ ...( ownsPressableDirectly
						? {
								href: EXTERNAL_PRESSABLE_AUTH_URL,
								target: '_blank',
								onClick: () => recordNavigation( 'pressable' ),
							}
						: toMenuItemProps( pressableMarketplaceProps ) ) }
					aria-label={ __( 'Add a new production site on Pressable' ) }
				/>
				<MenuItem
					icon={ <WordPressLogo /> }
					title="WordPress.com"
					description={ __( 'Optimized and hassle-free hosting for business websites.' ) }
					{ ...toMenuItemProps(
						hasPendingSites ? wpcomPendingLicensesProps : wpcomMarketplaceProps
					) }
					aria-label={ __( 'Add a new production site on WordPress.com' ) }
				>
					{ /* Stays mounted with nothing waiting: inserting a sibling once the
					     count arrives is what crashes translated pages. */ }
					<Text variant="muted" hidden={ ! hasPendingSites }>
						{ hasPendingSites
							? sprintf(
									/* translators: %d is the number of paid-for sites waiting to be set up. */
									_n( '%d site available', '%d sites available', availablePendingSites.length ),
									availablePendingSites.length
								)
							: '' }
					</Text>
				</MenuItem>
			</Column>
			<Column>
				<DevSiteCard
					availableDevSites={ devLicenses?.available }
					isAgencyApproved={ isAgencyApproved( agency ) }
					onClick={ () => selectAction( 'dev-site-configurations' ) }
				/>
			</Column>
		</Wrapper>
	);
}

export default AddNewSite;

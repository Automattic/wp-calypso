import {
	activeAgencyQuery,
	jetpackAgencyDevLicensesQuery,
	agencyPendingSitesQuery,
} from '@automattic/api-queries';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useQuery } from '@tanstack/react-query';
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
import { dashboardLink } from '../../../utils/link';
import A4ALogo from './a4a-logo';
import DevSiteCard from './dev-site-card';
import { getAvailablePendingSites, getPressableOwnershipType, isAgencyApproved } from './lib';
import type { AddNewSiteAction, AddNewSiteProps } from './types';
// The shared Column and MenuItem above are styled by the dotcom menu's stylesheet.
import '../../../sites/add-new-site/style.scss';

import './style.scss';

const EXTERNAL_PRESSABLE_AUTH_URL = 'https://my.pressable.com/agency/auth';

function AddNewSite( { onSelectAction }: AddNewSiteProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: pendingSites } = useQuery( agencyPendingSitesQuery( agencyId ) );
	const { data: devLicenses } = useQuery( jetpackAgencyDevLicensesQuery( agencyId ) );

	const availablePendingSites = getAvailablePendingSites( pendingSites );
	const hasPendingSites = availablePendingSites.length > 0;
	const pressableOwnership = getPressableOwnershipType( agency );
	const ownsPressableDirectly = pressableOwnership === 'regular';

	const isDesktop = useViewportMatch( 'medium' );
	const Wrapper = isDesktop ? HStack : VStack;

	const selectAction = ( action: AddNewSiteAction ) => {
		recordTracksEvent( 'calypso_dashboard_agency_sites_new_site_action_click_item', { action } );
		onSelectAction( action );
	};

	const recordNavigation = ( action: string ) => {
		recordTracksEvent( 'calypso_dashboard_agency_sites_new_site_action_click_item', { action } );
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
					description={ __( 'Optimized and hassle-free hosting for business websites.' ) }
					onClick={ () => recordNavigation( 'pressable' ) }
					href={
						ownsPressableDirectly
							? EXTERNAL_PRESSABLE_AUTH_URL
							: dashboardLink( '/marketplace/hosting/pressable' )
					}
					target={ ownsPressableDirectly ? '_blank' : undefined }
				/>
				<MenuItem
					icon={ <WordPressLogo /> }
					title="WordPress.com"
					description={ __( 'Best for large-scale businesses and major eCommerce sites.' ) }
					onClick={ () => recordNavigation( 'wpcom' ) }
					href={ dashboardLink(
						hasPendingSites ? '/sites/need-setup' : '/marketplace/hosting/wpcom'
					) }
				>
					{ hasPendingSites ? (
						<Text variant="muted">
							{ sprintf(
								/* translators: %d is the number of paid-for sites waiting to be set up. */
								_n( '%d site available', '%d sites available', availablePendingSites.length ),
								availablePendingSites.length
							) }
						</Text>
					) : undefined }
				</MenuItem>
			</Column>
			<Column>
				<DevSiteCard
					availableDevSites={ devLicenses?.available ?? 0 }
					isAgencyApproved={ isAgencyApproved( agency ) }
					onClick={ () => selectAction( 'dev-site-configurations' ) }
				/>
			</Column>
		</Wrapper>
	);
}

export default AddNewSite;

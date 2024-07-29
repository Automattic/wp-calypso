import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { useSiteDomainsQuery } from '@automattic/data-stores';
import { useState } from '@wordpress/element';
import { type } from 'calypso/lib/domains/constants';
import { canSetAsPrimary } from 'calypso/lib/domains/utils/can-set-as-primary';
import { isRecentlyRegisteredAndDoesNotPointToWpcom } from 'calypso/lib/domains/utils/is-recently-registered-and-does-not-point-to-wpcom';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainErrorNotice,
	showUpdatePrimaryDomainSuccessNotice,
} from 'calypso/state/domains/management/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type SetAsPrimaryLinkProps = {
	children?: React.ReactNode;
	domainName: string;
	siteIdOrSlug?: number | string;
	additionalProperties?: {
		clickOrigin: string;
	};
	onSuccess?: () => void;
};

const SetAsPrimaryLink = ( {
	children,
	domainName,
	additionalProperties,
	onSuccess,
}: SetAsPrimaryLinkProps ) => {
	const dispatch = useDispatch();

	const selectedSite = useSelector( getSelectedSite );

	const isOnFreePlan = selectedSite?.plan?.is_free ?? false;
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = siteDomains.find( ( domain ) => domain.name === domainName );
	const hasDomainOnlySite = useSelector( ( state ) =>
		isDomainOnlySite( state, selectedSite?.ID ?? 0 )
	);
	const hasNonPrimaryDomainsFlag = useSelector( ( state ) =>
		getCurrentUser( state ) ? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ) : false
	);
	const isManagingAllSites = useSelector( ( state ) =>
		isUnderDomainManagementAll( getCurrentRoute( state ) )
	);
	const canSetPrimaryDomain = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, FEATURE_SET_PRIMARY_CUSTOM_DOMAIN )
	);
	const { refetch } = useSiteDomainsQuery( selectedSite?.ID, {
		queryFn: () => fetchSiteDomains( selectedSite?.ID ),
	} );
	const [ isSettingPrimaryDomain, setIsSettingPrimaryDomain ] = useState( false );

	if ( ! selectedSite ) {
		return null;
	}

	const shouldUpgradeToMakeDomainPrimary =
		hasNonPrimaryDomainsFlag &&
		isOnFreePlan &&
		( domain.type === type.REGISTERED || domain.type === type.MAPPED ) &&
		! hasDomainOnlySite &&
		! domain.isPrimary &&
		! domain.isWPCOMDomain &&
		! domain.isWpcomStagingDomain &&
		! canSetPrimaryDomain;

	if ( ! canSetAsPrimary( domain, isManagingAllSites, shouldUpgradeToMakeDomainPrimary ) ) {
		return null;
	}

	const handleSetPrimaryDomainClick = async () => {
		if ( isSettingPrimaryDomain ) {
			return;
		}
		setIsSettingPrimaryDomain( true );
		dispatch(
			recordGoogleEvent(
				'Domain Management',
				'Changed Primary Domain through link component',
				'Domain Name',
				domain.name
			)
		);
		dispatch(
			recordTracksEvent( 'calypso_domain_management_settings_change_primary_domain_link_click', {
				origin: additionalProperties?.clickOrigin,
			} )
		);
		try {
			await dispatch( setPrimaryDomain( selectedSite.ID, domain.name ) );
			onSuccess?.();
			await refetch();
			dispatch( showUpdatePrimaryDomainSuccessNotice( domain.name ) );
		} catch ( error ) {
			dispatch( showUpdatePrimaryDomainErrorNotice( ( error as Error ).message ) );
		} finally {
			setIsSettingPrimaryDomain( false );
		}
	};

	const shouldDisableSetAsPrimaryButton =
		domain.isMoveToNewSitePending || isRecentlyRegisteredAndDoesNotPointToWpcom( domain );

	if ( shouldDisableSetAsPrimaryButton ) {
		return null;
	}

	return (
		<button
			className="action-button set-as-primary"
			onClick={ handleSetPrimaryDomainClick }
			disabled={ shouldDisableSetAsPrimaryButton || isSettingPrimaryDomain }
		>
			{ children }
		</button>
	);
};

export default SetAsPrimaryLink;

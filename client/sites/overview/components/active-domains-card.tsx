import page from '@automattic/calypso-router';
import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable, ResponseDomain } from '@automattic/domains-table';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo, useState } from 'react';
import SiteAddressChanger from 'calypso/blocks/site-address-changer';
import {
	HostingCard,
	HostingCardHeading,
	HostingCardLinkButton,
} from 'calypso/components/hosting-card';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { filterOutWpcomDomains } from 'calypso/my-sites/domains/domain-management/list/utils';
import { isNotAtomicJetpack } from 'calypso/sites-dashboard/utils';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainErrorNotice,
	showUpdatePrimaryDomainSuccessNotice,
} from 'calypso/state/domains/management/actions';
import { canAnySiteConnectDomains } from 'calypso/state/selectors/can-any-site-connect-domains';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const ActiveDomainsCard: FC = () => {
	const forceMobile = useBreakpoint( '<660px' );
	const site = useSelector( getSelectedSite );
	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const { data, isLoading, refetch } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ changeSiteAddressSourceDomain, setChangeSiteAddressSourceDomain ] =
		useState< ResponseDomain | null >( null );
	const userCanSetPrimaryDomains = useSelector(
		( state ) => ! currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);
	const hasConnectableSites = useSelector( canAnySiteConnectDomains );

	const hasNonWpcomDomains = useMemo( () => {
		return filterOutWpcomDomains( data?.domains ?? [] ).length > 0;
	}, [ data ] );

	// Do not render for self hosted jetpack sites, since they cannot manage domains with us.
	if ( isJetpackNotAtomic ) {
		return null;
	}
	return (
		<HostingCard className="hosting-overview__active-domains">
			<HostingCardHeading title={ translate( 'Active domains' ) }>
				<HostingCardLinkButton
					to={ `/domains/add/${ site?.slug }?redirect_to=${ window.location.pathname }` }
					hideOnMobile
					onClick={ () =>
						dispatch( recordTracksEvent( 'calypso_overview_add_domain_button_click' ) )
					}
				>
					{ translate( 'Add new domain' ) }
				</HostingCardLinkButton>
				<HostingCardLinkButton
					to={ `/domains/manage/${ site?.slug }` }
					onClick={ () =>
						dispatch( recordTracksEvent( 'calypso_overview_manage_domains_button_click' ) )
					}
				>
					{ translate( 'Manage domains' ) }
				</HostingCardLinkButton>
			</HostingCardHeading>

			<DomainsTable
				className="hosting-overview__domains-table"
				context="site"
				hideCheckbox
				isLoadingDomains={ isLoading }
				domains={ data?.domains }
				isAllSitesView={ false }
				isHostingOverview
				useMobileCards={ forceMobile }
				siteSlug={ site?.slug ?? null }
				userCanSetPrimaryDomains={ userCanSetPrimaryDomains }
				hasConnectableSites={ hasConnectableSites }
				onDomainAction={ ( action, domain ) => {
					if ( action === 'set-primary-address' && site ) {
						return {
							message: translate( 'Set domain as the primary site address' ),
							action: async () => {
								try {
									await dispatch( setPrimaryDomain( site.ID, domain.domain ) );
									dispatch( showUpdatePrimaryDomainSuccessNotice( domain.name ) );
									page.replace( `/overview/${ domain.domain }` );
									await refetch();
								} catch ( error ) {
									dispatch( showUpdatePrimaryDomainErrorNotice( ( error as Error ).message ) );
								}
							},
						};
					}

					if ( action === 'change-site-address' ) {
						setChangeSiteAddressSourceDomain( domain );
					}
				} }
			/>
			{ changeSiteAddressSourceDomain && (
				<SiteAddressChanger
					hasNonWpcomDomains={ hasNonWpcomDomains }
					currentDomain={ changeSiteAddressSourceDomain }
					currentDomainSuffix={ changeSiteAddressSourceDomain.name.match( /\.\w+\.\w+$/ )?.[ 0 ] }
					isDialogVisible
					onClose={ () => setChangeSiteAddressSourceDomain( null ) }
					onSiteAddressChanged={ async () => {
						await refetch();
						setChangeSiteAddressSourceDomain( null );
						if ( site?.slug ) {
							page.replace( `/overview/${ site?.slug }` );
						}
					} }
					skipRedirection
				/>
			) }
		</HostingCard>
	);
};

export default ActiveDomainsCard;

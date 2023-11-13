import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable, ResponseDomain } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useMemo, useState } from 'react';
import SiteAddressChanger from 'calypso/blocks/site-address-changer';
import { UsePresalesChat } from 'calypso/components/data/domain-management';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useOdieAssistantContext } from 'calypso/odie/context';
import { useSelector, useDispatch } from 'calypso/state';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainErrorNotice,
	showUpdatePrimaryDomainSuccessNotice,
} from 'calypso/state/domains/management/actions';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { hasDomainCredit as hasDomainCreditSelector } from 'calypso/state/sites/plans/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { domainManagementList } from '../../paths';
import DomainHeader from '../components/domain-header';
import {
	createBulkAction,
	deleteBulkActionStatus,
	fetchAllDomains,
	fetchBulkActionStatus,
	fetchSite,
	fetchSiteDomains,
} from '../domains-table-fetch-functions';
import EmptyDomainsListCard from './empty-domains-list-card';
import GoogleDomainOwnerBanner from './google-domain-owner-banner';
import { ManageAllDomainsCTA } from './manage-domains-cta';
import OptionsDomainButton from './options-domain-button';
import { usePurchaseActions } from './use-purchase-actions';
import { filterOutWpcomDomains } from './utils';

import './style.scss';

interface BulkSiteDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkSiteDomains( props: BulkSiteDomainsProps ) {
	const site = useSelector( getSelectedSite );
	const userCanSetPrimaryDomains = useSelector(
		( state ) => ! currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);
	const hasDomainCredit = useSelector( ( state ) => hasDomainCreditSelector( state, site?.ID ) );
	const { data, isLoading, refetch } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();
	const { sendNudge } = useOdieAssistantContext();
	const dispatch = useDispatch();
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );

	const hasNonWpcomDomains = useMemo( () => {
		return filterOutWpcomDomains( data?.domains ?? [] ).length > 0;
	}, [ data ] );

	const item = {
		label: translate( 'Domains' ),
		helpBubble: translate(
			'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
				},
			}
		),
	};

	const purchaseActions = usePurchaseActions();

	const buttons = [ <OptionsDomainButton key="breadcrumb_button_1" specificSiteActions /> ];

	const [ changeSiteAddressSourceDomain, setChangeSiteAddressSourceDomain ] =
		useState< ResponseDomain | null >( null );

	return (
		<>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white', 'is-bulk-domains-page' ] } />
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				{ ! isLoading && <GoogleDomainOwnerBanner /> }
				<DomainsTable
					isLoadingDomains={ isLoading }
					domains={ data?.domains }
					isAllSitesView={ false }
					siteSlug={ site?.slug ?? null }
					domainStatusPurchaseActions={ purchaseActions }
					userCanSetPrimaryDomains={ userCanSetPrimaryDomains }
					currentUserCanBulkUpdateContactInfo={ ! isInSupportSession }
					onDomainAction={ ( action, domain ) => {
						if ( action === 'manage-dns-settings' ) {
							return {
								action: () => {
									sendNudge( {
										nudge: 'dns-settings',
										initialMessage: translate(
											'I see you want to change your DNS settings for your domain %(domain)s. That’s a complex thing, but I can guide you and help you at any moment.',
											{
												args: {
													domain: domain.name,
												},
											}
										) as string,
										context: { domain: domain.domain },
									} );
								},
							};
						}

						if ( action === 'set-primary-address' && site ) {
							return {
								message: translate( 'Set domain as the primary site address' ),
								action: async () => {
									try {
										await dispatch( setPrimaryDomain( site.ID, domain.domain ) );
										dispatch( showUpdatePrimaryDomainSuccessNotice( domain.name ) );
										page.replace( domainManagementList( domain.domain ) );
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
					footer={
						<>
							{ ! isLoading && (
								<EmptyDomainsListCard
									selectedSite={ site }
									hasDomainCredit={ !! hasDomainCredit }
									isCompact={ hasNonWpcomDomains }
									hasNonWpcomDomains={ hasNonWpcomDomains }
								/>
							) }
							<ManageAllDomainsCTA shouldDisplaySeparator={ false } />
						</>
					}
					fetchAllDomains={ fetchAllDomains }
					fetchSite={ fetchSite }
					fetchSiteDomains={ fetchSiteDomains }
					createBulkAction={ createBulkAction }
					fetchBulkActionStatus={ fetchBulkActionStatus }
					deleteBulkActionStatus={ deleteBulkActionStatus }
				/>
				{ changeSiteAddressSourceDomain && (
					<SiteAddressChanger
						hasNonWpcomDomains={ hasNonWpcomDomains }
						currentDomain={ changeSiteAddressSourceDomain }
						currentDomainSuffix={ changeSiteAddressSourceDomain.name.match( /\.\w+\.\w+$/ )?.[ 0 ] }
						isDialogVisible
						onClose={ () => setChangeSiteAddressSourceDomain( null ) }
						onSiteAddressChanged={ () => refetch() }
					/>
				) }
			</Main>
			<UsePresalesChat />
		</>
	);
}

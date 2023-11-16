import { DomainsTable, useDomainsTable } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { UsePresalesChat } from 'calypso/components/data/domain-management';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useOdieAssistantContext } from 'calypso/odie/context';
import { useSelector } from 'calypso/state';
import { isSupportSession } from 'calypso/state/support/selectors';
import DomainHeader from '../components/domain-header';
import {
	createBulkAction,
	deleteBulkActionStatus,
	fetchAllDomains,
	fetchBulkActionStatus,
	fetchSite,
	fetchSiteDomains,
} from '../domains-table-fetch-functions';
import GoogleDomainOwnerBanner from './google-domain-owner-banner';
import OptionsDomainButton from './options-domain-button';
import { usePurchaseActions } from './use-purchase-actions';

import './style.scss';

interface BulkAllDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkAllDomains( props: BulkAllDomainsProps ) {
	const { domains, isLoading } = useDomainsTable( fetchAllDomains );
	const translate = useTranslate();
	const { sendNudge } = useOdieAssistantContext();
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );

	const item = {
		label: translate( 'All Domains' ),
		subtitle: translate(
			'Manage all your domains. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
				},
			}
		),
		helpBubble: translate(
			'Manage all your domains. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
				},
			}
		),
	};

	const buttons = [
		<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions allDomainsList />,
	];

	const purchaseActions = usePurchaseActions();

	return (
		<>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white', 'is-bulk-domains-page' ] } />
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				{ ! isLoading && <GoogleDomainOwnerBanner /> }
				<DomainsTable
					isLoadingDomains={ isLoading }
					domains={ domains }
					isAllSitesView
					domainStatusPurchaseActions={ purchaseActions }
					currentUserCanBulkUpdateContactInfo={ ! isInSupportSession }
					onDomainAction={ ( action, domain ) => {
						if ( action === 'manage-dns-settings' ) {
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
						}
					} }
					fetchAllDomains={ fetchAllDomains }
					fetchSite={ fetchSite }
					fetchSiteDomains={ fetchSiteDomains }
					createBulkAction={ createBulkAction }
					fetchBulkActionStatus={ fetchBulkActionStatus }
					deleteBulkActionStatus={ deleteBulkActionStatus }
				/>
			</Main>
			<UsePresalesChat />
		</>
	);
}

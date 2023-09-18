import { isEnabled } from '@automattic/calypso-config';
import { DomainsTable, useDomainsTable } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { UsePresalesChat } from 'calypso/components/data/domain-management';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useOdieAssistantContext } from 'calypso/odie/context';
import DomainHeader from '../components/domain-header';
import OptionsDomainButton from './options-domain-button';
import { usePurchaseActions } from './use-purchase-actions';

interface BulkAllDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkAllDomains( props: BulkAllDomainsProps ) {
	const { domains, isLoading } = useDomainsTable();
	const translate = useTranslate();
	const { sendNudge } = useOdieAssistantContext();

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
			<Main className="bulk-domains-main">
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				<DomainsTable
					isFetchingDomains={ isLoading }
					domains={ domains }
					isAllSitesView
					shouldDisplayContactInfoBulkAction={ isEnabled(
						'domains/bulk-actions-contact-info-editing'
					) }
					domainStatusPurchaseActions={ purchaseActions }
					onDomainAction={ ( action, domain ) => {
						if ( action === 'manage-dns-settings' ) {
							sendNudge( {
								nudge: 'dns-settings',
								initialMessage: `I see you want to change your DNS settings for your domain ${ domain.name }. That's a complex thing, but I can guide you and help you at any moment.`,
								context: { domain: domain.domain },
							} );
						}
					} }
				/>
			</Main>
			<UsePresalesChat />
		</>
	);
}

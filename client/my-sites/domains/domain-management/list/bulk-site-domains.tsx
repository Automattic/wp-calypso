import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { UsePresalesChat } from 'calypso/components/data/domain-management';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useOdieAssistantContext } from 'calypso/odie/context';
import { useSelector } from 'calypso/state';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DomainHeader from '../components/domain-header';
import OptionsDomainButton from './options-domain-button';

interface BulkSiteDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkSiteDomains( props: BulkSiteDomainsProps ) {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const userCanSetPrimaryDomains = useSelector(
		( state ) => ! currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);
	const { data } = useSiteDomainsQuery( siteSlug );
	const translate = useTranslate();
	const { sendNudge } = useOdieAssistantContext();

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

	const buttons = [
		<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions allDomainsList />,
	];

	return (
		<>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main className="bulk-domains-main">
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				<DomainsTable
					domains={ data?.domains }
					isAllSitesView={ false }
					siteSlug={ siteSlug }
					userCanSetPrimaryDomains={ userCanSetPrimaryDomains }
					onDomainAction={ ( action, domain ) => {
						if ( action === 'manage-dns-settings' ) {
							sendNudge( {
								nudge: 'dns-settings',
								initialMessage: `I see you want to change your DNS settings for your domain ${ domain.name }. That's a complex thing, but I can guide you and help you at any moment.`,
								context: { domain: domain.domain },
							} );
						}

						if ( action === 'set-primary' ) {
							// TODO
						}
					} }
				/>
			</Main>
			<UsePresalesChat />
		</>
	);
}

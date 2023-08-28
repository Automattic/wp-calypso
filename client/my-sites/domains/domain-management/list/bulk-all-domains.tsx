import {
	DomainsTable,
	useDomainsTable,
	DomainStatusPurchaseActions,
	ResponseDomain,
} from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { UsePresalesChat } from 'calypso/components/data/domain-management';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { handleRenewNowClick, shouldRenderExpiringCreditCard } from 'calypso/lib/purchases';
import { Purchase } from 'calypso/lib/purchases/types';
import { useDispatch } from 'calypso/state';
import DomainHeader from '../components/domain-header';
import OptionsDomainButton from './options-domain-button';

interface BulkAllDomainsProps {
	analyticsPath: string;
	analyticsTitle: string;
}

export default function BulkAllDomains( props: BulkAllDomainsProps ) {
	const { domains } = useDomainsTable();
	const dispatch = useDispatch();
	const translate = useTranslate();

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

	const isCreditCardExpiring = ( purchases: Purchase[] ) => ( domain: ResponseDomain ) => {
		const purchase = purchases?.find(
			( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
		);

		return ( purchase && dispatch( shouldRenderExpiringCreditCard( purchase ) ) ) ?? false;
	};

	const isPurchasedDomain = ( purchases: Purchase[] ) => ( domain: ResponseDomain ) => {
		const purchase = purchases?.find(
			( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
		);
		return !! purchase;
	};

	const onRenewNowClick =
		( purchases: Purchase[] ) => ( siteSlug: string, domain: ResponseDomain ) => {
			const purchase = purchases?.find(
				( p ) => p.id === parseInt( domain.subscriptionId ?? '', 10 )
			);
			if ( purchase ) {
				dispatch( handleRenewNowClick( purchase, siteSlug ) );
			}
		};

	const purchaseActions: DomainStatusPurchaseActions = {
		isCreditCardExpiring: isCreditCardExpiring( [] ),
		isPurchasedDomain: isPurchasedDomain( [] ),
		onRenewNowClick: onRenewNowClick( [] ),
	};

	return (
		<>
			<PageViewTracker path={ props.analyticsPath } title={ props.analyticsTitle } />
			<Main wideLayout>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ buttons } />
				<DomainsTable
					domains={ domains }
					dispatch={ dispatch }
					isAllSitesView
					domainStatusPurchaseActions={ purchaseActions }
				/>
			</Main>
			<UsePresalesChat />
		</>
	);
}

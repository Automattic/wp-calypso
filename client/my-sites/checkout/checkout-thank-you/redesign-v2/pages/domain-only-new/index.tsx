import { formatCurrency } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { OptionContent } from 'calypso/components/option-content';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import {
	createSiteFromDomainOnly,
	domainManagementTransferToOtherSite,
	domainAddEmailUpsell,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useSelector } from 'calypso/state';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { canAnySiteConnectDomains } from 'calypso/state/selectors/can-any-site-connect-domains';
import attachToSite from './icons/attach-to-site.svg';
import useDomainOnly from './icons/domain-only.svg';
import addMailbox from './icons/mailbox.svg';
import startSite from './icons/start-site.svg';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

import './style.scss';

export default function DomainOnlyNew( {
	domainPurchase,
	currency,
}: {
	domainPurchase: ReceiptPurchase;
	currency: string;
} ) {
	const translate = useTranslate();
	const hasConnectableSites = useSelector( canAnySiteConnectDomains );
	const dashboardOptIn = useSelector( hasDashboardOptIn );

	const planUpgradeCreditsApplicable = useDomainToPlanCreditsApplicable( domainPurchase.blogId );

	return (
		<div className="checkout-thank-you__domain-only-new-container">
			<Step.CenteredColumnLayout
				className="step-container-v2--domain-only-new domain-only-new"
				columnWidth={ 6 }
				heading={
					<Step.Heading
						text={ translate( 'Thank you for your purchase' ) }
						subText={ translate( 'Your new domain name is ready! How would you like to use it?' ) }
					/>
				}
				verticalAlign="center"
			>
				<OptionContent
					illustration={ <img src={ startSite } alt="" aria-hidden /> }
					titleText={ translate( 'Start a new site' ) }
					topText={ translate( 'Create and launch a site on WordPress.com.' ) }
					benefits={
						planUpgradeCreditsApplicable
							? [
									translate(
										'%(upgradeCredits)s in upgrade credits will be applied to new paid plan purchases.',
										{
											args: {
												upgradeCredits: formatCurrency( planUpgradeCreditsApplicable, currency, {
													stripZeros: true,
													isSmallestUnit: true,
												} ),
											},
										}
									),
							  ]
							: undefined
					}
					href={ createSiteFromDomainOnly( domainPurchase.meta, domainPurchase.blogId ) }
				/>
				<OptionContent
					illustration={ <img src={ addMailbox } alt="" aria-hidden /> }
					titleText={ translate( 'Add a mailbox' ) }
					topText={ translate( 'Stand out with a professional email address.' ) }
					href={
						dashboardOptIn
							? dashboardLink( `/emails/choose-email-solution/${ domainPurchase.meta }` )
							: domainAddEmailUpsell( domainPurchase.meta, domainPurchase.meta )
					}
				/>
				{ hasConnectableSites && (
					<OptionContent
						illustration={ <img src={ attachToSite } alt="" aria-hidden /> }
						titleText={ translate( 'Attach to an existing site' ) }
						topText={ translate( 'Attach your domain name to an existing WordPress.com site.' ) }
						href={
							dashboardOptIn
								? dashboardLink( `/domains/${ domainPurchase.meta }/transfer/other-site` )
								: domainManagementTransferToOtherSite( domainPurchase.meta, domainPurchase.meta )
						}
					/>
				) }
				<OptionContent
					illustration={ <img src={ useDomainOnly } alt="" aria-hidden /> }
					titleText={ translate( 'Use the domain name only' ) }
					topText={ translate(
						"Just use the domain name as-is and add a site whenever you're ready."
					) }
					href={
						dashboardOptIn
							? dashboardLink( `/domains/${ domainPurchase.meta }` )
							: domainManagementList( domainPurchase.meta, domainPurchase.meta )
					}
				/>
				<Step.LinkButton
					className="domain-only-new__migrate-link"
					href={ `/setup/site-migration?siteSlug=${ domainPurchase.meta }` }
				>
					{ translate( 'Migrate an existing site' ) }
				</Step.LinkButton>
			</Step.CenteredColumnLayout>
		</div>
	);
}

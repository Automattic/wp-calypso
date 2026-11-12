import { useHasEnTranslation } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice, NoticeActionButton } from '../../components/notice';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { canUserSetPrimaryDomain, isPrimaryDomainCandidate } from '../../utils/domain';
import { getSitePlanUpgradeUrl } from '../../utils/site-url';
import ChangePrimaryDomainModal from './change-primary-domain-modal';
import type { DomainSummary, Site, User } from '@automattic/api-core';

interface PrimaryDomainSelectorNoticeProps {
	domains: DomainSummary[];
	site: Site;
	user: User;
}

const PrimaryDomainSelectorNotice = ( {
	domains,
	site,
	user,
}: PrimaryDomainSelectorNoticeProps ) => {
	const hasEnTranslation = useHasEnTranslation();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const canUserSetPrimaryDomainOnThisSite = canUserSetPrimaryDomain( site, user );
	const primaryDomain = domains.find( ( domain ) => domain.primary_domain );
	const currentPrimaryDomain = primaryDomain?.domain;
	const domainsList = domains.filter( isPrimaryDomainCandidate );

	const renderMessage = () => {
		if ( ! canUserSetPrimaryDomainOnThisSite ) {
			const message = createInterpolateElement(
				hasEnTranslation(
					'Your site plan doesn’t allow you to set a custom domain as a primary site address. <upgradeLink>Upgrade to an annual paid plan</upgradeLink> and get a free one-year domain name registration or transfer. <learnMoreLink/>'
				)
					? __(
							'Your site plan doesn’t allow you to set a custom domain as a primary site address. <upgradeLink>Upgrade to an annual paid plan</upgradeLink> and get a free one-year domain name registration or transfer. <learnMoreLink/>'
						)
					: __(
							'Your site plan doesn’t allow you to set a custom domain as a primary site address.<br/><upgradeLink>Upgrade to an annual paid plan</upgradeLink> and get a free one-year domain name registration or transfer. <learnMoreLink/>'
						),
				{
					upgradeLink: (
						<UpsellCTAButton
							variant="link"
							href={ getSitePlanUpgradeUrl( site ) }
							upsellId="site-domains-primary-domain-selector"
							upsellFeatureId="domain"
						/>
					),
					br: <br />,
					learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
				}
			);

			return message;
		}

		if ( domainsList.length === 0 ) {
			return createInterpolateElement(
				__(
					'Before changing your primary site address you must register or connect a new custom domain. <learnMoreLink />'
				),
				{
					learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
				}
			);
		}

		return createInterpolateElement(
			__(
				'The current primary site address for this site is: <currentPrimaryDomain />. This is the site address your visitors will see while browsing your site. <learnMoreLink />'
			),
			{
				currentPrimaryDomain: <strong>{ currentPrimaryDomain }</strong>,
				learnMoreLink: <InlineSupportLink supportContext="primary-site-address" />,
			}
		);
	};

	return (
		<Notice
			variant="info"
			title={ __( 'Primary site address' ) }
			actions={
				canUserSetPrimaryDomainOnThisSite &&
				domainsList.length > 0 && (
					<NoticeActionButton variant="outline" onClick={ () => setIsModalOpen( true ) }>
						{ __( 'Change primary site address' ) }
					</NoticeActionButton>
				)
			}
		>
			{ renderMessage() }
			{ isModalOpen && (
				<ChangePrimaryDomainModal
					site={ site }
					currentPrimaryDomain={ primaryDomain }
					eligibleDomains={ domainsList }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</Notice>
	);
};

export default PrimaryDomainSelectorNotice;

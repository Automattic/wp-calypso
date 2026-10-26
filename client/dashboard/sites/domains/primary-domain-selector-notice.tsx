import {
	type DomainSummary,
	type Site,
	type User,
	DomainSubtype,
	DomainStatus,
} from '@automattic/api-core';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getSitePlanUpgradeUrl } from '../../utils/site-url';
import { userHasFlag } from '../../utils/user';
import ChangePrimaryDomainModal from './change-primary-domain-modal';

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
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const primaryWithPlanOnly = userHasFlag( user, 'calypso_allow_nonprimary_domains_without_plan' );
	const isOnFreePlan = site?.plan?.is_free ?? false;
	const canUserSetPrimaryDomainOnThisSite =
		! ( primaryWithPlanOnly && isOnFreePlan ) &&
		( site?.plan?.features?.active.includes( 'set-primary-custom-domain' ) ?? false );
	const currentPrimaryDomain = domains.find( ( domain ) => domain.primary_domain )?.domain;
	const domainsList = useMemo( () => {
		if ( ! domains || ! site ) {
			return [];
		}
		return domains.filter( ( domain ) => {
			// Basic eligibility criteria
			const isEligible =
				( domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION ||
					domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
					domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ) &&
				domain.can_set_as_primary &&
				! domain.primary_domain &&
				domain.domain_status.id !== DomainStatus.CONNECTION_ERROR;

			if ( ! isEligible ) {
				return false;
			}

			return true;
		} );
	}, [ domains, site ] );

	if ( ! domains || ! site ) {
		return null;
	}

	const renderMessage = () => {
		if ( ! canUserSetPrimaryDomainOnThisSite ) {
			const message = createInterpolateElement(
				__(
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
		<Notice variant="info" title={ __( 'Primary site address' ) }>
			<VStack spacing={ 4 }>
				<Text as="p">{ renderMessage() }</Text>
				{ canUserSetPrimaryDomainOnThisSite && domainsList.length > 0 && (
					<HStack justify="flex-start">
						<Button variant="link" onClick={ () => setIsModalOpen( true ) }>
							{ __( 'Change primary site address' ) }
						</Button>
					</HStack>
				) }
			</VStack>
			{ isModalOpen && (
				<ChangePrimaryDomainModal
					site={ site }
					currentPrimaryDomain={ currentPrimaryDomain }
					eligibleDomains={ domainsList }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</Notice>
	);
};

export default PrimaryDomainSelectorNotice;

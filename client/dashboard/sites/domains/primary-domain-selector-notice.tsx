import { type DomainSummary, type Site, type User } from '@automattic/api-core';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getSitePlanUpgradeUrl } from '../../utils/site-url';
import ChangePrimaryDomainModal from './change-primary-domain-modal';
import { usePrimaryDomainChange } from './use-primary-domain-change';

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
	const {
		canUserSetPrimaryDomainOnThisSite,
		canChangePrimaryDomain,
		currentPrimaryDomain,
		eligibleDomains,
	} = usePrimaryDomainChange( { domains, site, user } );

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

		if ( eligibleDomains.length === 0 ) {
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
				{ canChangePrimaryDomain && (
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
					eligibleDomains={ eligibleDomains }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</Notice>
	);
};

export default PrimaryDomainSelectorNotice;

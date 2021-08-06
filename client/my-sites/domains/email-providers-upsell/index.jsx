/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HeaderCake from 'calypso/components/header-cake';
import PromoCard from 'calypso/components/promo-section/promo-card';

/**
 * Style dependencies
 */
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';

export default function EmailProvidersUpsell( { domain } ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const handleGoBack = () => {
		page( domainAddNew( selectedSiteSlug ) );
	};

	const image = {
		path: emailIllustration,
		align: 'right',
	};

	return (
		<>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>

			<PromoCard
				isPrimary
				title={ translate( 'Add a professional email address to %(domainName)s', {
					args: {
						domainName: domain,
					},
					comment: '%(domainName)s is the domain name, e.g example.com',
				} ) }
				image={ image }
				className="email-providers-upsell__action-panel"
			>
				<p>{ translate( 'No setup or software required. Easy to manage from your dashboard.' ) }</p>
			</PromoCard>
		</>
	);
}

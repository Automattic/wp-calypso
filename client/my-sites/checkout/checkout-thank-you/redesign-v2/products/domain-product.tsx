import { isDomainMapping, isDomainTransfer } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import {
	createSiteFromDomainOnly,
	domainManagementEdit,
	domainManagementRoot,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

function getGravatarPopupInfo(): { gravatarOrigin: string; isInGravatarPopup: boolean } {
	if ( ! window.opener || window.opener.closed ) {
		return { gravatarOrigin: '', isInGravatarPopup: false };
	}

	const gravatarOrigin = window.name || '';
	const gravatarOriginRegex = /^https:\/\/(?:[a-z]{2}(?:-[a-z]{2})?\.)?gravatar\.com\/?$/i;
	const isInGravatarPopup = gravatarOriginRegex.test( gravatarOrigin );

	return { gravatarOrigin, isInGravatarPopup };
}

type DomainTransferSectionProps = {
	purchase: ReceiptPurchase;
	currency: string;
};

const DomainTransferSection = ( { purchase, currency }: DomainTransferSectionProps ) => {
	const translate = useTranslate();

	const purchaseLabel = ( priceInteger: number ) => {
		if ( priceInteger === 0 ) {
			return translate( 'We’ve paid for an extra year' );
		}

		const priceFormatted = formatCurrency( priceInteger, currency, {
			stripZeros: true,
			isSmallestUnit: true,
		} );

		return translate( '%(priceFormatted)s for one year', { args: { priceFormatted } } );
	};

	return <p>{ purchaseLabel( purchase.priceInteger ) }</p>;
};

type ThankYouDomainProductProps = {
	purchase?: ReceiptPurchase;
	domainName?: string;
	isDomainOnly?: boolean;
	siteSlug?: string | null;
	currency?: string;
	isGravatarDomain?: boolean;
};

export default function ThankYouDomainProduct( {
	purchase,
	domainName,
	isDomainOnly,
	siteSlug,
	currency,
	isGravatarDomain,
}: ThankYouDomainProductProps ) {
	const translate = useTranslate();
	const currentRoute = useSelector( getCurrentRoute );

	domainName ??= purchase?.meta;

	// Gravatar: Send a message to notify the parent window that the domain claim is completed.
	useEffect( () => {
		if ( ! domainName || ! isGravatarDomain ) {
			return;
		}

		const { gravatarOrigin, isInGravatarPopup } = getGravatarPopupInfo();

		if ( ! isInGravatarPopup ) {
			return;
		}

		try {
			// Send a message to the opener window to indicate that the domain claim is completed.
			window.opener.postMessage( { type: 'DOMAIN_CLAIM_COMPLETED', domainName }, gravatarOrigin );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error sending message to parent window: ', error );
		}
	}, [ domainName, isGravatarDomain ] );

	// Do not proceed if a domain is not specified by domain name or a purchase object.
	if ( ! domainName ) {
		return null;
	}

	let actions;

	if ( purchase && isDomainTransfer( purchase ) ) {
		actions = <DomainTransferSection purchase={ purchase } currency={ currency ?? 'USD' } />;
	} else if ( isGravatarDomain ) {
		actions = (
			<Button variant="primary" href="https://gravatar.com/profile">
				{ translate( 'Return to Gravatar' ) }
			</Button>
		);

		// If the page is opened in Gravatar popup, we will automatically close the popup for the user.
		if ( getGravatarPopupInfo().isInGravatarPopup ) {
			actions = (
				<Button isBusy disabled>
					{ translate( 'Processing…' ) }
				</Button>
			);
		}
	} else if ( purchase?.blogId && siteSlug ) {
		const createSiteHref = siteSlug && createSiteFromDomainOnly( siteSlug, purchase.blogId );
		const createSiteProps = createSiteHref ? { href: createSiteHref } : { disabled: true };

		const manageDomainHref = siteSlug && domainManagementEdit( siteSlug, domainName, currentRoute );
		const manageDomainProps = manageDomainHref ? { href: manageDomainHref } : { disabled: true };

		actions = (
			<>
				{ isDomainOnly && (
					<Button className="is-primary" { ...createSiteProps }>
						{ translate( 'Create site' ) }
					</Button>
				) }

				<Button variant={ isDomainOnly ? 'secondary' : 'primary' } { ...manageDomainProps }>
					{ translate( 'Manage domain' ) }
				</Button>
			</>
		);
	} else {
		actions = (
			<Button variant={ isDomainOnly ? 'secondary' : 'primary' } href={ domainManagementRoot() }>
				{ translate( 'Manage domains' ) }
			</Button>
		);
	}

	const isDomainConnection = purchase && isDomainMapping( purchase );

	return (
		<ThankYouProduct
			name={ domainName }
			details={ isDomainConnection ? translate( 'Domain connection' ) : undefined }
			isFree={ purchase?.priceInteger === 0 }
			actions={ actions }
		/>
	);
}

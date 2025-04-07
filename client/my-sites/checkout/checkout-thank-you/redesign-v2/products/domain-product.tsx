import { isDomainMapping, isDomainTransfer } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import {
	createSiteFromDomainOnly,
	domainManagementEdit,
	domainManagementRoot,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

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

import { isDomainTransfer } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { Button, ClipboardButton } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

type ThankYouDomainProductProps = {
	purchase?: ReceiptPurchase;
	domainName?: string;
	shareSite?: boolean;
	siteSlug?: string | null;
	currency?: string;
};

type DomainTransferSectionProps = {
	purchase: ReceiptPurchase;
	currency: string;
};

const DomainTransferSection = ( { purchase, currency }: DomainTransferSectionProps ) => {
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

export default function ThankYouDomainProduct( {
	purchase,
	domainName,
	shareSite,
	siteSlug,
	currency,
}: ThankYouDomainProductProps ) {
	const [ isCopying, setIsCopying ] = useState( false );
	const domain = domainName ?? purchase?.meta;

	// Do not proceed if a domain is not specified by domain name or a purchase object.
	if ( ! domain ) {
		return null;
	}

	const actions =
		purchase && isDomainTransfer( purchase ) ? (
			<DomainTransferSection purchase={ purchase } currency={ currency ?? 'USD' } />
		) : (
			<>
				{ shareSite && domain && (
					<ClipboardButton
						className="is-primary"
						onCopy={ () => setIsCopying( true ) }
						onFinishCopy={ () => setIsCopying( false ) }
						text={ domain }
					>
						{ isCopying ? translate( 'Site copied' ) : translate( 'Share site' ) }
					</ClipboardButton>
				) }
				<Button
					variant={ shareSite ? 'secondary' : 'primary' }
					href={ siteSlug ? domainManagementList( siteSlug ) : domainManagementRoot() }
				>
					{ translate( 'Manage domains' ) }
				</Button>
			</>
		);

	return (
		<ThankYouProduct
			name={ domain }
			isFree={ purchase?.priceInteger === 0 }
			actions={ actions }
			key={ 'domain-' + domain }
		/>
	);
}

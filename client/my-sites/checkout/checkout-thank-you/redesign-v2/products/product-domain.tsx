import { isDomainTransfer } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { Button, ClipboardButton } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

type ProductDomainProps = {
	purchase?: ReceiptPurchase;
	domainName?: string;
	shareSite?: boolean;
	siteSlug?: string | null;
	currency?: string;
};

const ProductDomain = ( {
	purchase,
	domainName,
	shareSite,
	siteSlug,
	currency,
}: ProductDomainProps ) => {
	const { __ } = useI18n();
	const [ isCopying, setIsCopying ] = useState( false );
	const domain = domainName ?? purchase?.meta;

	// Do not proceed if a domain is not specified by domain name or a purchase object.
	if ( ! domain ) {
		return null;
	}

	const handleShareSite = ( processing: boolean ) => () => {
		setIsCopying( processing );
	};

	const purchaseLabel = ( priceInteger: number ) => {
		if ( priceInteger === 0 ) {
			return __( 'We’ve paid for an extra year' );
		}

		const priceFormatted = formatCurrency( priceInteger, currency ?? 'USD', {
			stripZeros: true,
			isSmallestUnit: true,
		} );

		return translate( '%(priceFormatted)s for one year', { args: { priceFormatted } } );
	};

	const actions =
		purchase && isDomainTransfer( purchase ) ? (
			<p>{ purchaseLabel( purchase.priceInteger ) }</p>
		) : (
			<>
				{ shareSite && domain && (
					<ClipboardButton
						className="is-primary"
						onCopy={ handleShareSite( true ) }
						onFinishCopy={ handleShareSite( false ) }
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
		) : (
			<p>{ purchaseLabel( purchase?.priceInteger ) }</p>
		);

	return (
		<ThankYouProduct
			name={ domain }
			isFree={ purchase?.priceInteger === 0 }
			actions={ actions }
			key={ 'domain-' + domain }
		/>
	);
};

export default ProductDomain;

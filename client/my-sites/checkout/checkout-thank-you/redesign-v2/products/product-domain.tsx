import { isDomainTransfer } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { Button, ClipboardButton } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';

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

	const handleShareSite = ( processing: boolean ) => () => {
		setIsCopying( processing );
	};

	const purchaseLabel = ( priceInteger: number ) => {
		if ( priceInteger === 0 ) {
			return __( 'We’ve paid for an extra year' );
		}

		const priceFormatted = formatCurrency( priceInteger, currency, {
			stripZeros: true,
			isSmallestUnit: true,
		} );

		return translate( '%(priceFormatted)s for one year', { args: { priceFormatted } } );
	};

	const actions =
		domainName || ! isDomainTransfer( purchase ) ? (
			<>
				{ shareSite && (
					<ClipboardButton
						// @ts-expect-error The button props are passed into a Button component internally, but the types don't account that.
						variant="primary"
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
			<p>{ purchaseLabel( purchase.priceInteger ) }</p>
		);

	return (
		<ThankYouProduct
			name={ domain }
			isFree={ purchase ? purchase.priceInteger === 0 : false }
			actions={ actions }
			key={ 'domain-' + domain }
		/>
	);
};

export default ProductDomain;

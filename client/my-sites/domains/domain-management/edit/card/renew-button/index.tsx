import { Button } from '@automattic/components';
import clsx from 'clsx';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { handleRenewNowClick, getRenewalPrice } from 'calypso/lib/purchases';
import { useDispatch } from 'calypso/state';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './style.scss';

type RenewButtonProps = {
	purchase: Purchase | null;
	selectedSite: SiteDetails;
	subscriptionId: number;
	compact?: boolean;
	customLabel?: string;
	disabled?: boolean;
	primary?: boolean;
	redemptionProduct?: ProductListItem;
	reactivate?: boolean;
	tracksProps?: Record< string, string >;
};

function RenewButton( {
	purchase,
	selectedSite,
	subscriptionId,
	compact,
	customLabel,
	disabled,
	primary,
	redemptionProduct,
	reactivate,
	tracksProps,
}: RenewButtonProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	if ( ! subscriptionId ) {
		return null;
	}

	let formattedPrice: string | null = '...';
	let loading = true;

	if ( purchase && selectedSite.ID ) {
		const renewalPrice = getRenewalPrice( purchase ) + ( redemptionProduct?.cost ?? 0 );
		const currencyCode = purchase.currencyCode;
		formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } );
		loading = false;
	}

	const buttonClasses = clsx( 'renew-button', { 'is-loading': loading } );
	let buttonLabel;
	if ( reactivate ) {
		buttonLabel = translate( 'Reactivate for {{strong}}%(price)s{{/strong}}', {
			components: { strong: <strong /> },
			args: { price: formattedPrice },
		} );
	} else if ( customLabel ) {
		buttonLabel = customLabel;
	} else {
		buttonLabel = translate( 'Renew now for {{strong}}%(price)s{{/strong}}', {
			components: { strong: <strong /> },
			args: { price: formattedPrice },
		} );
	}

	function handleRenew() {
		dispatch( handleRenewNowClick( purchase as Purchase, selectedSite.slug, { tracksProps } ) );
	}

	return (
		<Button
			compact={ compact }
			primary={ primary }
			className={ buttonClasses }
			onClick={ handleRenew }
			disabled={ disabled }
		>
			{ buttonLabel }
		</Button>
	);
}

export default RenewButton;

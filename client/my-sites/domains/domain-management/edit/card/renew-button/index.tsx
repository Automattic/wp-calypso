import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { handleRenewNowClick, getRenewalPrice } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactChild } from 'react';

import './style.scss';

type RenewButtonProps = {
	purchase: Purchase | null;
	selectedSite: SiteData;
	subscriptionId: number;
	compact?: boolean;
	primary?: boolean;
	disabled?: boolean;
	redemptionProduct?: ProductListItem;
	reactivate?: boolean;
	customLabel?: ReactChild;
	tracksProps?: Record< string, string >;
};

function RenewButton( {
	compact,
	primary,
	selectedSite,
	subscriptionId,
	redemptionProduct,
	reactivate,
	customLabel,
	tracksProps,
	purchase,
	disabled,
}: RenewButtonProps ) {
	const translate = useTranslate();

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

	const buttonClasses = classNames( 'renew-button', { 'is-loading': loading } );
	let buttonLabel: ReactChild;
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
		handleRenewNowClick( purchase as Purchase, selectedSite.slug, { tracksProps } );
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

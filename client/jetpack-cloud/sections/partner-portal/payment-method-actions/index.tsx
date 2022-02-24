import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { PaymentMethod } from 'calypso/lib/checkout/payment-methods';

import './style.scss';

interface Props {
	card: PaymentMethod;
}

const PaymentMethodActions: FunctionComponent< Props > = () => {
	const translate = useTranslate();

	const renderDeleteAction = () => {
		return <PopoverMenuItem key="delete">{ translate( 'Delete' ) }</PopoverMenuItem>;
	};

	const renderActions = () => {
		const actions = [];

		actions.push( renderDeleteAction() );

		return actions;
	};

	return (
		<EllipsisMenu
			icon={
				<svg
					width="24"
					height="24"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					aria-hidden="true"
					focusable="false"
				>
					<path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"></path>
				</svg>
			}
			className="payment-method-actions"
			popoverClassName="payment-method-actions__popover"
		>
			{ renderActions() }
		</EllipsisMenu>
	);
};

export default PaymentMethodActions;

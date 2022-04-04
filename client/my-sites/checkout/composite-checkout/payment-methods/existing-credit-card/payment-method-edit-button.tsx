import { Button } from '@automattic/components';
import type { FunctionComponent, ReactNode } from 'react';

interface Props {
	onClick: () => void;
	buttonTextContent: string;
	scary: boolean;
	borderless: boolean;
	icon?: ReactNode;
	disabled?: boolean;
}

const PaymentMethodEditButton: FunctionComponent< Props > = ( {
	onClick,
	buttonTextContent,
	scary,
	borderless,
	icon,
	disabled,
} ) => {
	return (
		<Button
			compact
			borderless={ borderless }
			scary={ scary }
			className="payment-method-edit-button"
			onClick={ onClick }
			disabled={ disabled }
		>
			{ icon }
			{ buttonTextContent }
		</Button>
	);
};

export default PaymentMethodEditButton;

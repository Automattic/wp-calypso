import { Button } from '@wordpress/components';
import { FunctionComponent } from 'react';

interface Props {
	href: string;
	onClick?: () => void;
	children?: React.ReactNode;
}

const BillingButton: FunctionComponent< Props > = ( { href, children, onClick = () => null } ) => {
	return (
		<Button
			onClick={ onClick }
			className="hb-pricing-plans-embed__detail-cta"
			href={ href }
			target="_blank"
			isPrimary
		>
			{ children }
		</Button>
	);
};

export default BillingButton;

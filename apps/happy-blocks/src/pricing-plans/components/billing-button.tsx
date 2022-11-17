import { Button } from '@wordpress/components';
import { FunctionComponent } from 'react';

interface Props {
	href: string;
}

const BillingButton: FunctionComponent< Props > = ( { href, children } ) => {
	return (
		<Button className="hb-pricing-plans-embed__detail-cta" href={ href } target="_blank" isPrimary>
			{ children }
		</Button>
	);
};

export default BillingButton;

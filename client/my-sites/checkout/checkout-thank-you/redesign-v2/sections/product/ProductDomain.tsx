import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';

import './style.scss';

type ProductDomainProps = {
	domain: string;
};

const ProductDomain = ( { domain }: ProductDomainProps ) => {
	return (
		<div className="checkout-thank-you__header-details">
			<div className="checkout-thank-you__header-details-content">
				<>
					<div className="checkout-thank-you__header-details-content-name">{ domain }</div>
				</>
			</div>
			<div className="checkout-thank-you__header-details-buttons">
				<Button variant="primary" href={ domainManagementRoot() }>
					{ translate( 'Manage domains' ) }
				</Button>
			</div>
		</div>
	);
};

export default ProductDomain;

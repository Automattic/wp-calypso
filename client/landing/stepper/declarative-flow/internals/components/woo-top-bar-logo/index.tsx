import { WooCommerceWooLogo } from '@automattic/components';

import './style.scss';

export const WooTopBarLogo = () => (
	<div className="woo-top-bar-logo" role="img" aria-label="WooCommerce">
		<WooCommerceWooLogo className="woo-top-bar-logo__svg" width={ 59 } height={ 15 } />
	</div>
);

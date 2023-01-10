import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';

import './style.scss';

export const PricingBanner: React.FC = () => {
	return (
		<div className="jetpack-product-store__pricing-banner">
			<IntroPricingBanner />
		</div>
	);
};

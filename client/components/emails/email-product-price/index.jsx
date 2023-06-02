import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { FreeTrialPriceInformation } from 'calypso/my-sites/email/email-providers-comparison/price/price-information';

import './style.scss';

const EmailProductPrice = ( { product } ) => {
	const translate = useTranslate();
	const message = translate( 'Free for the first three months' );

	if ( ! product ) {
		return <div className="email-product-price is-placeholder">{ translate( 'Loading…' ) }</div>;
	}

	return (
		<div className="email-product-price is-free-email email-product-price__email-step-signup-flow">
			<div className="email-product-price__free-text">{ message }</div>
			<FreeTrialPriceInformation className="email-product-price__free-price" product={ product } />
		</div>
	);
};

EmailProductPrice.propTypes = {
	price: PropTypes.string,
};

export default EmailProductPrice;

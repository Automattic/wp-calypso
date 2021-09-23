import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

const EmailProductPrice = ( { isLoading, price } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const startDate = moment().add( 3, 'months' ).format( 'LL' );
	const message = translate( 'Free for the first three months' );
	const priceText = translate( '%(price)s /user /month starting %(startDate)s', {
		args: {
			price,
			startDate,
		},
		comment:
			'%(price)s is the price of a subscription, and %(startDate)s is the date the subscription will first renew',
	} );

	if ( isLoading ) {
		return <div className="email-product-price is-placeholder">{ translate( 'Loading…' ) }</div>;
	}

	return (
		<div className="email-product-price is-free-email email-product-price__email-step-signup-flow">
			<div className="email-product-price__free-text">{ message }</div>
			<div className="email-product-price__free-price">{ priceText }</div>
		</div>
	);
};

EmailProductPrice.propTypes = {
	isLoading: PropTypes.bool,
	price: PropTypes.string,
};

export default EmailProductPrice;

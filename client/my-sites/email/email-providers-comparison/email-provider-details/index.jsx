/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import EmailProviderFeature from './email-provider-feature';
import PromoCard from 'components/promo-section/promo-card';
import PromoCardPrice from 'components/promo-section/promo-card/price';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProviderDetails extends React.Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		image: PropTypes.object.isRequired,
		features: PropTypes.array.isRequired,
		badge: PropTypes.string,
		formattedPrice: PropTypes.string,
		billingInterval: PropTypes.string,
		discount: PropTypes.string,
	};

	renderFeatures() {
		return this.props.features.map( ( feature, index ) => (
			<EmailProviderFeature key={ `feature-${ index }` } title={ feature } />
		) );
	}

	render() {
		const {
			badge,
			description,
			image,
			title,
			formattedPrice,
			billingInterval,
			discount,
		} = this.props;

		return (
			<PromoCard { ...{ title, image, badge } }>
				<p className="email-provider-details__description">{ description }</p>
				<PromoCardPrice { ...{ formattedPrice, billingInterval, discount } } />
				<div>{ this.renderFeatures() }</div>
			</PromoCard>
		);
	}
}

export default EmailProviderDetails;

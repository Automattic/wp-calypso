/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
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
		features: PropTypes.arrayOf( PropTypes.string ).isRequired,
		badge: PropTypes.string,
		formattedPrice: PropTypes.string,
		discount: PropTypes.string,
		buttonLabel: PropTypes.string,
		hasPrimaryButton: PropTypes.bool,
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
			discount,
			buttonLabel,
			hasPrimaryButton,
		} = this.props;

		return (
			<PromoCard { ...{ title, image, badge } }>
				<p className="email-provider-details__description">{ description }</p>
				<PromoCardPrice { ...{ formattedPrice, discount } } />
				<Button className="email-provider-details__cta" primary={ hasPrimaryButton }>
					{ buttonLabel }
				</Button>
				<div>{ this.renderFeatures() }</div>
			</PromoCard>
		);
	}
}

export default EmailProviderDetails;

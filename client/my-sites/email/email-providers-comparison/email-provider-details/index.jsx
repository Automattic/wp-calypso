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
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => {};

class EmailProviderDetails extends React.Component {
	static propTypes = {
		additionalPriceInformation: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		badge: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
		buttonLabel: PropTypes.string,
		className: PropTypes.string,
		description: PropTypes.string.isRequired,
		discount: PropTypes.string,
		features: PropTypes.arrayOf( PropTypes.string ).isRequired,
		formattedPrice: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		hasPrimaryButton: PropTypes.bool,
		image: PropTypes.object.isRequired,
		isButtonBusy: PropTypes.bool,
		onButtonClick: PropTypes.func,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		onButtonClick: noop,
	};

	renderFeatures() {
		return this.props.features.map( ( feature, index ) => (
			<EmailProviderFeature key={ `feature-${ index }` } title={ feature } />
		) );
	}

	render() {
		const {
			additionalPriceInformation,
			badge,
			buttonLabel,
			className,
			description,
			discount,
			formattedPrice,
			hasPrimaryButton,
			image,
			isButtonBusy,
			title,
		} = this.props;

		return (
			<PromoCard { ...{ className, title, image, badge } }>
				<p className="email-provider-details__description">{ description }</p>

				<PromoCardPrice { ...{ formattedPrice, discount } } />

				{ additionalPriceInformation && (
					<span className="email-provider-details__additional-price-information">
						{ additionalPriceInformation }
					</span>
				) }

				<Button
					className="email-provider-details__cta"
					primary={ hasPrimaryButton }
					onClick={ this.props.onButtonClick }
					busy={ isButtonBusy }
				>
					{ buttonLabel }
				</Button>

				<div>{ this.renderFeatures() }</div>
			</PromoCard>
		);
	}
}

export default EmailProviderDetails;

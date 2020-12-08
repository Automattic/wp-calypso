/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

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

class EmailProviderDetails extends React.Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		image: PropTypes.object.isRequired,
		features: PropTypes.arrayOf( PropTypes.string ).isRequired,
		badge: PropTypes.string,
		formattedPrice: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		discount: PropTypes.string,
		buttonLabel: PropTypes.string,
		hasPrimaryButton: PropTypes.bool,
		className: PropTypes.string,
		onButtonClick: PropTypes.func,
		isButtonBusy: PropTypes.bool,
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
			badge,
			description,
			image,
			title,
			formattedPrice,
			discount,
			buttonLabel,
			hasPrimaryButton,
			className,
			isButtonBusy,
		} = this.props;

		return (
			<PromoCard { ...{ className, title, image, badge } }>
				<p className="email-provider-details__description">{ description }</p>
				<PromoCardPrice { ...{ formattedPrice, discount } } />
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

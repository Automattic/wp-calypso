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
	};

	renderFeatures() {
		return this.props.features.map( ( feature, index ) => (
			<EmailProviderFeature key={ `feature-${ index }` } title={ feature } />
		) );
	}

	render() {
		const { description, image, title } = this.props;

		return (
			<PromoCard title={ title } image={ image }>
				<p className="email-provider-details__description">{ description }</p>
				<div>{ this.renderFeatures() }</div>
			</PromoCard>
		);
	}
}

export default EmailProviderDetails;

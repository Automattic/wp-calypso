/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import EmailProviderFeature from './email-provider-details/email-provider-feature';

function EmailProviderCard( {
	children,
	providerKey,
	logo,
	title,
	badge,
	description,
	formattedPrice,
	discount,
	additionalPriceInformation,
	formFields,
	buttonLabel,
	buttonDisabled,
	onButtonClick,
	features,
} ) {
	const renderFeatures = ( providerSlug, featureList ) => {
		return featureList.map( ( feature, index ) => (
			<EmailProviderFeature key={ `feature-${ providerSlug }-${ index }` } title={ feature } />
		) );
	};

	return (
		<PromoCard
			className="email-providers-comparison__provider-card"
			image={ logo }
			title={ title }
			badge={ badge }
		>
			<p>{ description }</p>
			<PromoCardPrice formattedPrice={ formattedPrice } discount={ discount } />
			{ additionalPriceInformation && (
				<span className="email-providers-comparison__provider-additional-price-information">
					{ additionalPriceInformation }
				</span>
			) }
			<div className="email-providers-comparison__provider-form-and-features">
				<div className="email-providers-comparison__provider-form">
					{ formFields }
					<Button primary onClick={ onButtonClick } disabled={ buttonDisabled }>
						{ buttonLabel }
					</Button>
				</div>
				<div className="email-providers-comparison__provider-features">
					{ features && renderFeatures( providerKey, features ) }
				</div>
			</div>
			{ children }
		</PromoCard>
	);
}

EmailProviderCard.propTypes = {
	providerKey: PropTypes.string.isRequired,
	logo: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
	badge: PropTypes.object,
	description: PropTypes.string,
	formattedPrice: PropTypes.node,
	discount: PropTypes.string,
	additionalPriceInformation: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	formFields: PropTypes.node,
	buttonLabel: PropTypes.string.isRequired,
	buttonDisabled: PropTypes.bool,
	onButtonClick: PropTypes.func,
	features: PropTypes.arrayOf( PropTypes.string ),
};

export default EmailProviderCard;

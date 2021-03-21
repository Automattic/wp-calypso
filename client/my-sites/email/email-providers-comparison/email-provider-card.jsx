/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import EmailProviderFeature from './email-provider-details/email-provider-feature';

const noop = () => {};

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
	detailsExpanded = false,
	onExpandedChange = noop,
	formFields,
	buttonLabel,
	buttonDisabled,
	onButtonClick,
	features,
} ) {
	const [ isExpanded, setIsExpanded ] = useState( detailsExpanded );

	const renderFeatures = ( providerSlug, featureList ) => {
		return featureList.map( ( feature, index ) => (
			<EmailProviderFeature key={ `feature-${ providerSlug }-${ index }` } title={ feature } />
		) );
	};

	const toggleVisibility = ( event ) => {
		event.preventDefault();
		setIsExpanded( ! isExpanded );
		onExpandedChange( providerKey, ! isExpanded );
	};

	return (
		<PromoCard
			className={ classnames( 'email-providers-comparison__provider-card', {
				'is-expanded': isExpanded,
			} ) }
			image={ logo }
			title={ title }
			badge={ badge }
		>
			<div className="email-providers-comparison__provider-card-main-details">
				<p>{ description }</p>
				<Button
					primary={ false }
					onClick={ toggleVisibility }
					className="email-providers-comparison__provider-expand-cta"
				>
					{ buttonLabel }
				</Button>
			</div>
			<PromoCardPrice formattedPrice={ formattedPrice } discount={ discount } />
			{ additionalPriceInformation && (
				<span className="email-providers-comparison__provider-additional-price-information">
					{ additionalPriceInformation }
				</span>
			) }
			<div className="email-providers-comparison__provider-form-and-features">
				<div className="email-providers-comparison__provider-form">
					{ formFields }
					{ buttonLabel && (
						<Button primary onClick={ onButtonClick } disabled={ buttonDisabled }>
							{ buttonLabel }
						</Button>
					) }
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
	buttonLabel: PropTypes.string,
	buttonDisabled: PropTypes.bool,
	onButtonClick: PropTypes.func,
	features: PropTypes.arrayOf( PropTypes.string ),
};

export default EmailProviderCard;

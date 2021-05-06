/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import EmailProviderFeatures from 'calypso/my-sites/email/email-provider-features';

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
	onButtonClick,
	showExpandButton = true,
	expandButtonLabel,
	features,
} ) {
	const toggleVisibility = ( event ) => {
		event.preventDefault();
		onExpandedChange( providerKey, ! detailsExpanded );
	};

	const labelForExpandButton = expandButtonLabel ? expandButtonLabel : buttonLabel;

	return (
		<PromoCard
			className={ classnames( 'email-providers-comparison__provider-card', {
				'is-expanded': detailsExpanded,
			} ) }
			image={ logo }
			title={ title }
			badge={ badge }
		>
			<div className="email-providers-comparison__provider-card-main-details">
				<p>{ description }</p>

				{ showExpandButton && (
					<Button
						primary={ false }
						onClick={ toggleVisibility }
						className="email-providers-comparison__provider-expand-cta"
					>
						{ labelForExpandButton }
					</Button>
				) }
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
						<Button primary onClick={ onButtonClick }>
							{ buttonLabel }
						</Button>
					) }
				</div>

				<EmailProviderFeatures features={ features } />
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
	onButtonClick: PropTypes.func,
	showExpandButton: PropTypes.bool,
	expandButtonLabel: PropTypes.string,
	features: PropTypes.arrayOf( PropTypes.string ),
	onExpandedChange: PropTypes.func,
};

export default EmailProviderCard;

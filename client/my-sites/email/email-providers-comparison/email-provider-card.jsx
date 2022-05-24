import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import EmailProviderFeatures from 'calypso/my-sites/email/email-provider-features';
import EmailProviderFeaturesToggleButton from 'calypso/my-sites/email/email-provider-features/toggle-button';

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
	detailsExpanded = false,
	onExpandedChange = noop,
	formFields,
	buttonLabel,
	onButtonClick,
	showExpandButton = true,
	expandButtonLabel,
	features,
	appLogos,
} ) {
	const [ areFeaturesExpanded, setFeaturesExpanded ] = useState( false );

	const isViewportSizeLowerThan1040px = useBreakpoint( '<1040px' );

	const showFeaturesToggleButton = detailsExpanded && isViewportSizeLowerThan1040px;

	const expandCard = ( event ) => {
		event.preventDefault();

		onExpandedChange( providerKey, true );
	};

	const labelForExpandButton = expandButtonLabel ? expandButtonLabel : buttonLabel;

	return (
		<PromoCard
			className={ classnames( 'email-providers-comparison__provider-card', {
				'is-expanded': detailsExpanded,
				'is-forwarding': providerKey === 'forwarding',
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
						onClick={ expandCard }
						className="email-providers-comparison__provider-expand-cta"
					>
						{ labelForExpandButton }
					</Button>
				) }
			</div>

			<div className="email-providers-comparison__provider-price-and-button">
				<div>
					<PromoCardPrice formattedPrice={ formattedPrice } discount={ discount } />
				</div>

				{ showFeaturesToggleButton && (
					<EmailProviderFeaturesToggleButton
						handleClick={ () => setFeaturesExpanded( ! areFeaturesExpanded ) }
						isRelatedContentExpanded={ areFeaturesExpanded }
					/>
				) }
			</div>

			<div className="email-providers-comparison__provider-form-and-features">
				<div className="email-providers-comparison__provider-form">
					{ formFields }

					{ buttonLabel && (
						<Button primary onClick={ onButtonClick }>
							{ buttonLabel }
						</Button>
					) }
				</div>

				{ ( ! showFeaturesToggleButton || areFeaturesExpanded ) && (
					<EmailProviderFeatures features={ features } logos={ appLogos } />
				) }
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
	discount: PropTypes.node,
	formFields: PropTypes.node,
	buttonLabel: PropTypes.string,
	onButtonClick: PropTypes.func,
	showExpandButton: PropTypes.bool,
	expandButtonLabel: PropTypes.string,
	features: PropTypes.arrayOf( PropTypes.string ),
	appLogos: PropTypes.arrayOf( PropTypes.object ),
	onExpandedChange: PropTypes.func,
};

export default EmailProviderCard;

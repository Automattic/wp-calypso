import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import { FunctionComponent, useState } from 'react';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import EmailProviderFeaturesToggleButton from 'calypso/my-sites/email/email-provider-features/toggle-button';
import EmailProviderStackedFeatures from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card/email-provider-stacked-features';
import { ProviderCard } from 'calypso/my-sites/email/email-providers-stacked-comparison/index';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const EmailProvidersStackedCard: FunctionComponent< ProviderCard > = ( props ) => {
	const {
		additionalPriceInformation,
		badge,
		buttonLabel,
		children,
		description,
		detailsExpanded,
		discount,
		expandButtonLabel,
		features,
		footerBadge,
		formattedPrice,
		formFields,
		logo,
		onButtonClick = noop,
		onExpandedChange = noop,
		productName,
		providerKey,
		showExpandButton = true,
	} = props;

	const [ areFeaturesExpanded, setFeaturesExpanded ] = useState( false );

	const isViewportSizeLowerThan1040px = useBreakpoint( '<1040px' );

	const showFeaturesToggleButton = detailsExpanded && isViewportSizeLowerThan1040px;

	const toggleVisibility = ( event: React.MouseEvent ): void => {
		event.preventDefault();

		onExpandedChange( providerKey, ! detailsExpanded );
	};

	const labelForExpandButton = expandButtonLabel ? expandButtonLabel : buttonLabel;

	return (
		<PromoCard
			className={ classnames( 'email-providers-comparison__provider-card', {
				'is-expanded': detailsExpanded,
				'is-forwarding': providerKey === 'forwarding',
			} ) }
			image={ logo }
			title={ productName }
			badge={ badge }
			icon={ '' }
		>
			<div className="email-provider-stacked-card__provider-card-main-details">
				<p>{ description }</p>

				{ showExpandButton && (
					<Button
						primary={ false }
						onClick={ toggleVisibility }
						className="email-provider-stacked-card__provider-expand-cta"
					>
						{ labelForExpandButton }
					</Button>
				) }
			</div>

			<div className="email-provider-stacked-card__provider-price-and-button">
				<div>
					<PromoCardPrice formattedPrice={ formattedPrice } discount={ discount } />

					{ additionalPriceInformation && (
						<div className="email-provider-stacked-card__provider-additional-price-information">
							{ additionalPriceInformation }
						</div>
					) }
				</div>

				{ showFeaturesToggleButton && (
					<EmailProviderFeaturesToggleButton
						handleClick={ () => setFeaturesExpanded( ! areFeaturesExpanded ) }
						isRelatedContentExpanded={ areFeaturesExpanded }
					/>
				) }
			</div>

			<div className="email-provider-stacked-card__provider-form-and-features">
				<div className="email-provider-stacked-card__provider-form">
					{ formFields }

					{ buttonLabel && (
						<Button primary onClick={ onButtonClick }>
							{ buttonLabel }
						</Button>
					) }
				</div>

				{ ( ! showFeaturesToggleButton || areFeaturesExpanded ) && (
					<EmailProviderStackedFeatures features={ features } badge={ footerBadge } />
				) }
			</div>

			{ children }
		</PromoCard>
	);
};

export default EmailProvidersStackedCard;

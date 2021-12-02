import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import { FunctionComponent, useState } from 'react';
import PromoCard from 'calypso/components/promo-section/promo-card';
import EmailProviderFeaturesToggleButton from 'calypso/my-sites/email/email-provider-features/toggle-button';
import EmailProviderStackedFeatures from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card/email-provider-stacked-features';
import type { ProviderCard } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/provider-card-props';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const EmailProvidersStackedCard: FunctionComponent< ProviderCard > = ( props ) => {
	const {
		buttonLabel,
		children,
		description,
		detailsExpanded,
		expandButtonLabel,
		features,
		footerBadge,
		formFields,
		logo,
		onButtonClick = noop,
		onExpandedChange = noop,
		priceBadge = null,
		productName,
		providerKey,
		showExpandButton = true,
	} = props;

	const [ areFeaturesExpanded, setFeaturesExpanded ] = useState( false );

	const isViewportSizeLowerThan1040px = useBreakpoint( '<1040px' );

	const showFeaturesToggleButton = detailsExpanded && isViewportSizeLowerThan1040px;

	const toggleVisibility = ( event: React.MouseEvent ): void => {
		event.preventDefault();

		onExpandedChange( providerKey ?? '', ! detailsExpanded );
	};

	const labelForExpandButton = expandButtonLabel ? expandButtonLabel : buttonLabel;

	const header = (
		<div className="email-provider-stacked-card__header">
			<div className="email-provider-stacked-card__title-container">
				<h2 className="email-provider-stacked-card__title wp-brand-font"> { productName } </h2>
				<p>{ description }</p>
			</div>
			{ priceBadge }
		</div>
	);

	return (
		<PromoCard
			className={ classnames( 'email-providers-stacked-comparison__provider-card', {
				'is-expanded': detailsExpanded,
				'is-forwarding': providerKey === 'forwarding',
			} ) }
			image={ logo }
			titleComponent={ header }
			icon={ '' }
		>
			<div className="email-provider-stacked-card__provider-card-main-details">
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
				{ showFeaturesToggleButton && (
					<EmailProviderFeaturesToggleButton
						handleClick={ () => setFeaturesExpanded( ! areFeaturesExpanded ) }
						isRelatedContentExpanded={ areFeaturesExpanded }
					/>
				) }
			</div>

			<div className="email-provider-stacked-card__provider-form-and-right-panel">
				<div className="email-provider-stacked-card__provider-form">
					{ formFields }

					{ buttonLabel && (
						<Button primary onClick={ onButtonClick }>
							{ buttonLabel }
						</Button>
					) }
				</div>
				<div className="email-provider-stacked-card__provider-right-panel">
					{ ( ! showFeaturesToggleButton || areFeaturesExpanded ) && (
						<>
							<EmailProviderStackedFeatures features={ features } /> { footerBadge }
						</>
					) }
				</div>
			</div>

			{ children }
		</PromoCard>
	);
};

export default EmailProvidersStackedCard;

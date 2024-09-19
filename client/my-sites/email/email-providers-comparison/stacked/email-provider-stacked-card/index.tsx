import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useState } from 'react';
import PromoCard, { TitleLocation } from 'calypso/components/promo-section/promo-card';
import {
	EmailProviderStackedFeatures,
	EmailProviderStackedFeaturesToggleButton,
} from 'calypso/my-sites/email/email-providers-comparison/stacked/email-provider-stacked-card/email-provider-stacked-features';
import type { ProviderCardProps } from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/provider-card-props';
import type { MouseEvent } from 'react';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const EmailProvidersStackedCard = ( {
	appLogos = [],
	className,
	description,
	detailsExpanded,
	expandButtonLabel,
	features,
	footerBadge,
	formFields,
	logo,
	onExpandedChange = noop,
	priceBadge = null,
	productName,
	providerKey,
	showExpandButton = true,
}: ProviderCardProps ) => {
	const [ areFeaturesExpanded, setFeaturesExpanded ] = useState( false );

	const isViewportSizeLowerThan660px = useBreakpoint( '<660px' );

	const showFeaturesToggleButton = detailsExpanded && isViewportSizeLowerThan660px;

	const toggleVisibility = ( event: MouseEvent ): void => {
		event.preventDefault();

		onExpandedChange( providerKey, ! detailsExpanded );
	};

	const header = (
		<div className="email-provider-stacked-card__header">
			<div className="email-provider-stacked-card__title-container">
				<h2 className="email-provider-stacked-card__title"> { productName } </h2>
				<p>{ description }</p>
			</div>

			<div className="email-provider-stacked-card__title-price-badge">{ priceBadge }</div>

			{ showExpandButton && ! detailsExpanded && (
				<div className="email-provider-stacked-card__provider-card-main-details">
					<Button
						primary={ false }
						disabled={ onExpandedChange === noop }
						onClick={ toggleVisibility }
						className="email-provider-stacked-card__provider-expand-cta"
					>
						{ expandButtonLabel }
					</Button>
				</div>
			) }
		</div>
	);

	return (
		<PromoCard
			className={ clsx( 'email-providers-stacked-comparison__provider-card', className, {
				'is-expanded': detailsExpanded,
			} ) }
			image={ logo }
			titleComponent={ header }
			titleComponentLocation={
				isViewportSizeLowerThan660px ? TitleLocation.FIGURE : TitleLocation.BODY
			}
			icon=""
		>
			{ showFeaturesToggleButton && (
				<div className="email-provider-stacked-card__provider-price-and-button">
					<EmailProviderStackedFeaturesToggleButton
						handleClick={ () => setFeaturesExpanded( ! areFeaturesExpanded ) }
						isRelatedContentExpanded={ areFeaturesExpanded }
					/>
				</div>
			) }

			<div className="email-provider-stacked-card__provider-form-and-right-panel">
				<div className="email-provider-stacked-card__provider-form">{ formFields }</div>
				<div className="email-provider-stacked-card__provider-right-panel">
					{ ( ! showFeaturesToggleButton || areFeaturesExpanded ) && (
						<>
							<EmailProviderStackedFeatures features={ features } appLogos={ appLogos } />
							{ footerBadge }
						</>
					) }
				</div>
			</div>
		</PromoCard>
	);
};

export default EmailProvidersStackedCard;

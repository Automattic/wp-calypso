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
		children,
		description,
		detailsExpanded,
		disabled,
		disabledReason,
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
	} = props;

	const [ areFeaturesExpanded, setFeaturesExpanded ] = useState( false );

	const isViewportSizeLowerThan1040px = useBreakpoint( '<1040px' );

	const showFeaturesToggleButton = detailsExpanded && isViewportSizeLowerThan1040px;

	const toggleVisibility = ( event: React.MouseEvent ): void => {
		event.preventDefault();

		onExpandedChange( providerKey, ! detailsExpanded );
	};

	const reasonClass = classnames( 'email-provider-stacked-card__title-price-badge', {
		'email-provider-stacked-card__disabled-reason': disabled,
	} );
	const header = (
		<div className="email-provider-stacked-card__header">
			<div className="email-provider-stacked-card__title-container">
				<h2 className="email-provider-stacked-card__title wp-brand-font"> { productName } </h2>
				<p>{ description }</p>
			</div>
			<div className={ reasonClass }>
				{ ! disabled && priceBadge }
				{ disabled && (
					<span className={ 'email-provider-stacked-card__disabled-reason' }>
						{ disabledReason }
					</span>
				) }
			</div>
			{ ! disabled && (
				<div className="email-provider-stacked-card__provider-card-main-details">
					{ showExpandButton && ! disabled && (
						<Button
							primary={ false }
							onClick={ toggleVisibility }
							className="email-provider-stacked-card__provider-expand-cta"
						>
							{ expandButtonLabel }
						</Button>
					) }
				</div>
			) }
		</div>
	);

	const containerClasses = classnames( 'email-providers-stacked-comparison__provider-card', {
		disabled: disabled,
		'is-expanded': detailsExpanded && ! disabled,
	} );

	return (
		<PromoCard className={ containerClasses } image={ logo } titleComponent={ header } icon={ '' }>
			<div className="email-provider-stacked-card__provider-price-and-button">
				{ showFeaturesToggleButton && (
					<EmailProviderFeaturesToggleButton
						handleClick={ () => setFeaturesExpanded( ! areFeaturesExpanded ) }
						isRelatedContentExpanded={ areFeaturesExpanded }
					/>
				) }
			</div>

			<div className="email-provider-stacked-card__provider-form-and-right-panel">
				<div className="email-provider-stacked-card__provider-form">{ formFields }</div>
				<div className="email-provider-stacked-card__provider-right-panel">
					{ ( ! showFeaturesToggleButton || areFeaturesExpanded ) && (
						<>
							<EmailProviderStackedFeatures features={ features } /> { footerBadge }
						</>
					) }
				</div>
			</div>

			{ ! disabled && children }
		</PromoCard>
	);
};

export default EmailProvidersStackedCard;

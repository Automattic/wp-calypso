/** @format */

/**
 * External dependencies
 */

import React, { FunctionComponent } from 'react';

/**
 * Internal depencies
 */
import Button from 'components/button';

export interface CtaButton {
	text: string;
	url: string;
}

export interface Props {
	button: CtaButton;
	learnMoreLink?: string;
	isPrimary?: boolean;
}

const PromoCardCta: FunctionComponent< Props > = ( { button, learnMoreLink, isPrimary } ) => {
	return (
		<div className="promo-card__cta">
			<Button
				className="promo-card__cta-button"
				href="{ button.url }"
				primary={ true === isPrimary }
			>
				{ button.text }
			</Button>
			{ learnMoreLink && (
				<Button borderless className="promo-card__cta-learn-more" href="{ learnMoreLink }">
					Learn More
				</Button>
			) }
		</div>
	);
};

export default PromoCardCta;

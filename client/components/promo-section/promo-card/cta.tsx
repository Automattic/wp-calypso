/** @format */

/**
 * External dependencies
 */

import React, { FC } from 'react';

/**
 * Internal depencies
 */
import Button from 'components/button';

interface CtaButton {
	isPrimary: boolean;
	text: string;
	url: string;
}

interface Props {
	button: CtaButton;
	learnMoreLink?: string;
}

const PromoCardCta: FC< Props > = ( { button, learnMoreLink } ) => {
	return (
		<div class="promo-card__cta">
			<Button className="promo-card__cta-button" href="{ button.url }">
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

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
	text: string;
	url: string;
}

interface Props {
	button: CtaButton;
	learnMoreLink?: string;
	isPrimary?: boolean;
}

const PromoCardCta: FC< Props > = ( { button, learnMoreLink, isPrimary } ) => {
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

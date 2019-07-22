/** @format */

/**
 * External dependencies
 */

import React, { FunctionComponent } from 'react';

/**
 * Internal depencies
 */
import Button from 'components/button';
import ActionPanelCta from 'components/action-panel/cta';

type ClickCallback = () => void;

export interface CtaButton {
	text: string;
	action: string | ClickCallback;
}

export interface Props {
	button: CtaButton;
	learnMoreLink?: string;
	isPrimary?: boolean;
}

const PromoCardCta: FunctionComponent< Props > = ( { button, learnMoreLink, isPrimary } ) => {
	const props = {
		className: 'promo-card__cta-button',
		primary: true === isPrimary,
		[ typeof button.action === 'string' ? 'href' : 'onClick' ]: button.action,
	};

	return (
		<ActionPanelCta>
			<Button { ...props }>{ button.text }</Button>
			{ learnMoreLink && (
				<Button borderless className="promo-card__cta-learn-more" href="{ learnMoreLink }">
					Learn More
				</Button>
			) }
		</ActionPanelCta>
	);
};

export default PromoCardCta;

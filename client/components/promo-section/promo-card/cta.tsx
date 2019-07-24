/** @format */

/**
 * External dependencies
 */

import React, { FunctionComponent } from 'react';
import { partialRight } from 'lodash';

/**
 * Internal depencies
 */
import Button from 'components/button';
import ActionPanelCta from 'components/action-panel/cta';
import PlanGate from 'components/plan-gate';

type ClickCallback = () => void;

export interface CtaButton {
	text: string;
	action: string | ClickCallback;
}

export type Cta =
	| CtaButton
	| {
			feature: string;
			upgradeButton: CtaButton;
			defaultButton: CtaButton;
			activatedButton?: CtaButton;
	  };

export interface Props {
	cta: Cta;
	learnMoreLink?: string;
	isPrimary?: boolean;
}

function isCtaButton( cta: Cta ): cta is CtaButton {
	return undefined !== ( cta as CtaButton ).text;
}

function buttonProps( button: CtaButton, isPrimary: boolean ) {
	return {
		className: 'promo-card__cta-button',
		primary: isPrimary,
		[ typeof button.action === 'string' ? 'href' : 'onClick' ]: button.action,
	};
}
const PromoCardCta: FunctionComponent< Props > = ( { cta, learnMoreLink, isPrimary } ) => {
	const ctaBtnProps = partialRight( buttonProps, true === isPrimary );
	let ctaBtn;

	if ( isCtaButton( cta ) ) {
		ctaBtn = <Button { ...ctaBtnProps( cta ) }>{ cta.text }</Button>;
	} else {
		ctaBtn = (
			<PlanGate feature={ cta.feature }>
				<Button { ...ctaBtnProps( cta.upgradeButton ) }>{ cta.upgradeButton.text }</Button>
				<Button { ...ctaBtnProps( cta.defaultButton ) }>{ cta.defaultButton.text }</Button>
			</PlanGate>
		);
	}
	return (
		<ActionPanelCta>
			{ ctaBtn }
			{ learnMoreLink && (
				<Button borderless className="promo-card__cta-learn-more" href="{ learnMoreLink }">
					Learn More
				</Button>
			) }
		</ActionPanelCta>
	);
};

export default PromoCardCta;

/**
 * External dependencies
 */

import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { partialRight } from 'lodash';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal depencies
 */
import Button from 'components/button';
import ActionPanelCta from 'components/action-panel/cta';
import { hasFeature } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { URL } from 'types';

type ClickCallback = () => void;

export interface CtaButton {
	text: string;
	action: URL | ClickCallback;
}

export type Cta =
	| CtaButton
	| {
			feature: string;
			upgradeButton: CtaButton;
			defaultButton: CtaButton;
			activatedButton?: CtaButton;
	  };

interface ConnectedProps {
	hasPlanFeature: boolean;
}

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
const PromoCardCta: FunctionComponent< Props & ConnectedProps > = ( {
	cta,
	learnMoreLink,
	isPrimary,
	hasPlanFeature,
} ) => {
	const ctaBtnProps = partialRight( buttonProps, true === isPrimary );
	let ctaBtn;
	const translate = useTranslate();

	if ( isCtaButton( cta ) ) {
		ctaBtn = <Button { ...ctaBtnProps( cta ) }>{ cta.text }</Button>;
	} else {
		ctaBtn = hasPlanFeature ? (
			<Button { ...ctaBtnProps( cta.defaultButton ) }>{ cta.defaultButton.text }</Button>
		) : (
			<Button { ...ctaBtnProps( cta.upgradeButton ) }>{ cta.upgradeButton.text }</Button>
		);
	}
	return (
		<ActionPanelCta>
			{ ctaBtn }
			{ learnMoreLink && (
				<Button borderless className="promo-card__cta-learn-more" href={ learnMoreLink }>
					{ translate( 'Learn more' ) }
				</Button>
			) }
		</ActionPanelCta>
	);
};

export default connect< ConnectedProps, {}, Props >( ( state, { cta } ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		hasPlanFeature:
			selectedSiteId && ! isCtaButton( cta )
				? hasFeature( state, selectedSiteId, cta.feature )
				: false,
	};
} )( PromoCardCta );

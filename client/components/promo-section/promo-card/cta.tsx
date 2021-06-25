/**
 * External dependencies
 */

import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { partialRight } from 'lodash';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ActionPanelCta from 'calypso/components/action-panel/cta';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { URL } from 'calypso/types';
import { localizeUrl } from 'calypso/lib/i18n-utils';

type ClickCallback = () => void;

interface CtaAction {
	url: URL;
	onClick: ClickCallback;
	selfTarget?: boolean;
}

export interface CtaButton {
	text: string | TranslateResult;
	action: URL | ClickCallback | CtaAction;
	component?: JSX.Element;
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
	learnMoreLink?: CtaAction;
	isPrimary?: boolean;
}

function isCtaButton( cta: Cta ): cta is CtaButton {
	return undefined !== ( cta as CtaButton ).text;
}

function isCtaAction( action: any ): action is CtaAction {
	return undefined !== ( action as CtaAction ).onClick;
}

function buttonProps( button: CtaButton, isPrimary: boolean ) {
	const actionProps = isCtaAction( button.action )
		? {
				href: button.action.url,
				onClick: button.action.onClick,
				selfTarget: button.action.selfTarget,
		  }
		: {
				[ typeof button.action === 'string' ? 'href' : 'onClick' ]: button.action,
		  };

	if ( undefined !== actionProps.href && ! actionProps.selfTarget ) {
		actionProps.target = '_blank';
	}
	// React doesn't recognize `selfTarget` as a valid prop of a DOM element. Removing it prevents a warning in the console.
	if ( 'selfTarget' in actionProps ) {
		delete actionProps.selfTarget;
	}

	return {
		className: 'promo-card__cta-button',
		primary: isPrimary,
		...actionProps,
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
	let learnMore = null;

	if ( learnMoreLink ) {
		learnMore = isCtaAction( learnMoreLink )
			? {
					href: localizeUrl( learnMoreLink.url ),
					target: '_blank',
					onClick: learnMoreLink.onClick,
			  }
			: {
					target: '_blank',
					href: localizeUrl( learnMoreLink ),
			  };
	}

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
			{ learnMore && (
				<Button borderless className="promo-card__cta-learn-more" { ...learnMore }>
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

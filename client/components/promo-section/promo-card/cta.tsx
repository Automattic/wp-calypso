import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ActionPanelCta from 'calypso/components/action-panel/cta';
import { URL } from 'calypso/types';

type ClickCallback = () => void;

interface CtaAction {
	url: URL;
	onClick: ClickCallback;
	selfTarget?: boolean;
	label?: string;
}

export interface CtaButton {
	text: string | TranslateResult;
	action: URL | ClickCallback | CtaAction;
	component?: JSX.Element;
	disabled?: boolean;
	busy?: boolean;
}

export interface Props {
	cta: CtaButton;
	learnMoreLink?: CtaAction | null;
	/**
	 * Displays "Included in your current plan" if true or "Not included in your current plan" if false.
	 * Ignored if undefined or if `learnMoreLink` is set.
	 */
	featureIncludedInPlan?: boolean;
	isPrimary?: boolean;
}

function isCtaAction( action: unknown ): action is CtaAction {
	return undefined !== ( action as CtaAction ).onClick;
}

function buttonProps( button: CtaButton, isPrimary: boolean ) {
	const actionProps: Record< string, string | boolean | ClickCallback | undefined > = isCtaAction(
		button.action
	)
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
		disabled: button.disabled ? true : false,
		busy: button.busy ? true : false,
		...actionProps,
	};
}
const PromoCardCta: FunctionComponent< Props > = ( {
	cta,
	learnMoreLink,
	featureIncludedInPlan,
	isPrimary,
} ) => {
	const ctaBtnProps = ( button: CtaButton ) => buttonProps( button, true === isPrimary );
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

	const getAvailabilityNotice = () => {
		if ( featureIncludedInPlan === undefined ) {
			return null;
		}
		return featureIncludedInPlan ? (
			<div className="promo-card__availability">
				<Gridicon icon="checkmark" className="promo-card__checkmark" size={ 18 } />
				<span>{ translate( 'Included in your plan' ) }</span>
			</div>
		) : (
			<div className="promo-card__availability">
				<Gridicon icon="cross-small" className="promo-card__cross" size={ 18 } />
				<span>{ translate( 'Not included in your current plan' ) }</span>
			</div>
		);
	};

	return (
		<ActionPanelCta>
			<Button { ...ctaBtnProps( cta ) }>{ cta.text }</Button>
			{ learnMore && (
				<Button borderless className="promo-card__cta-learn-more" { ...learnMore }>
					{ learnMoreLink?.label || translate( 'Learn more' ) }
				</Button>
			) }
			{ ! learnMore && getAvailabilityNotice() }
		</ActionPanelCta>
	);
};

export default PromoCardCta;

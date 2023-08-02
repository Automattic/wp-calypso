import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	TYPE_FREE,
	TYPE_FLEXIBLE,
	PLAN_WPCOM_PRO,
	PLAN_FREE,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_STARTER,
	TYPE_STARTER,
	TYPE_PRO,
	PLAN_WPCOM_PRO_MONTHLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import i18n, { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import type { WPComPlan } from '@automattic/calypso-products';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	plan: WPComPlan;
	buttonText?: TranslateResult;
	canPurchase?: boolean;
	currentSitePlanSlug?: string;
	isCurrentPlan?: boolean;
	isInSignup?: boolean;
	isPlaceholder?: boolean;
	isPrimary?: boolean;
	manageHref?: string;
	onClick?: () => void;
	disabled?: boolean;
}

type TranslateFunc = ReturnType< typeof useTranslate >;

function getButtonText( props: Partial< Props >, translate: TranslateFunc ): TranslateResult {
	const { isCurrentPlan, plan } = props;

	if ( ! plan ) {
		return translate( 'Start' );
	}

	const planTitle = plan.getTitle();
	const planSlug = plan.getStoreSlug();

	if ( [ PLAN_WPCOM_PRO, PLAN_WPCOM_PRO_MONTHLY ].includes( planSlug ) ) {
		return 'en' === i18n.getLocaleSlug() || i18n.hasTranslation( 'Choose Pro' )
			? translate( 'Choose Pro' )
			: translate( 'Try Pro risk-free' );
	} else if ( planSlug === PLAN_WPCOM_STARTER ) {
		return translate( 'Choose Starter' );
	} else if ( planSlug === PLAN_FREE || planSlug === PLAN_WPCOM_FLEXIBLE ) {
		return translate( 'Start with Free' );
	}

	if ( isCurrentPlan ) {
		return props.canPurchase ? translate( 'Manage plan' ) : translate( 'View plan' );
	}

	return translate( 'Start with %(planTitle)s', {
		args: { planTitle },
	} );
}

export const PlansComparisonAction: React.FunctionComponent< Props > = ( {
	buttonText,
	currentSitePlanSlug,
	manageHref,
	onClick,
	disabled,
	...props
} ) => {
	const { plan } = props;
	const translate = useTranslate();
	const className = classNames( { 'is-primary': props.isPrimary } );
	const { isCurrentPlan, isInSignup, isPlaceholder } = props;

	const handleClick = useCallback( () => {
		if ( isPlaceholder ) {
			return;
		}

		recordTracksEvent( 'calypso_plan_features_upgrade_click', {
			current_plan: currentSitePlanSlug || null,
			upgrading_to: plan.type,
		} );

		onClick?.();
	}, [ currentSitePlanSlug, isPlaceholder, onClick, plan.type ] );

	if ( ! buttonText ) {
		buttonText = getButtonText( props, translate );
	}

	if ( isInSignup || ! isCurrentPlan ) {
		manageHref = undefined;
	}

	if ( ! isInSignup ) {
		if ( isCurrentPlan ) {
			return <Button disabled>{ translate( 'This is your plan' ) }</Button>;
		}

		if (
			( currentSitePlanSlug === 'value_bundle' && [ TYPE_STARTER ].includes( plan.type ) ) ||
			( currentSitePlanSlug === 'business-bundle' &&
				[ TYPE_STARTER, TYPE_PRO ].includes( plan.type ) )
		) {
			return <Button disabled>{ translate( 'Unavailable' ) }</Button>;
		}

		if ( [ TYPE_FLEXIBLE, TYPE_FREE ].includes( plan.type ) ) {
			return null;
		}
	}

	return (
		<Button
			className={ className }
			onClick={ handleClick }
			href={ manageHref }
			disabled={ disabled }
		>
			{ buttonText }
		</Button>
	);
};

import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	TYPE_FREE,
	TYPE_FLEXIBLE,
	PLAN_WPCOM_PRO,
	PLAN_FREE,
	PLAN_WPCOM_FLEXIBLE,
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
}

type TranslateFunc = ReturnType< typeof useTranslate >;

function getButtonText( props: Partial< Props >, translate: TranslateFunc ): TranslateResult {
	const { isCurrentPlan, plan } = props;

	const planTitle = plan?.getTitle();
	const planSlug = plan?.getStoreSlug();

	if ( planSlug === PLAN_WPCOM_PRO ) {
		return 'en' === i18n.getLocaleSlug() || i18n.hasTranslation( 'Start with Pro' )
			? translate( 'Start with Pro' )
			: translate( 'Try Pro risk-free' );
	} else if ( planSlug === PLAN_FREE || planSlug === PLAN_WPCOM_FLEXIBLE ) {
		return translate( 'Start with Free' );
	}

	if ( isCurrentPlan ) {
		return props.canPurchase ? translate( 'Manage plan' ) : translate( 'View plan' );
	}

	return translate( 'Start with %(plan)s', {
		args: {
			plan: planTitle,
		},
	} );
}

export const PlansComparisonAction: React.FunctionComponent< Props > = ( {
	buttonText,
	currentSitePlanSlug,
	manageHref,
	onClick,
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

	if ( ! isInSignup && [ TYPE_FLEXIBLE, TYPE_FREE ].includes( plan.type ) ) {
		return null;
	}

	return (
		<Button className={ className } onClick={ handleClick } href={ manageHref }>
			{ buttonText }
		</Button>
	);
};

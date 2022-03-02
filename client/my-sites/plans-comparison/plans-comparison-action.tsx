import { recordTracksEvent } from '@automattic/calypso-analytics';
import { TYPE_FREE, TYPE_FLEXIBLE } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
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
	const { isCurrentPlan, isInSignup, plan } = props;

	if ( isInSignup ) {
		return translate( 'Start with %(plan)s', {
			args: {
				plan: plan?.getTitle(),
			},
		} );
	}

	if ( isCurrentPlan ) {
		return props.canPurchase ? translate( 'Manage plan' ) : translate( 'View plan' );
	}

	return translate( 'Select %(plan)s', {
		args: {
			plan: plan?.getTitle(),
		},
		comment: 'Button to select a paid plan by plan name, e.g., "Select Managed"',
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

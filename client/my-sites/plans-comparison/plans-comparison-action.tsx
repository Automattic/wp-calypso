import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	planName: string;
	planType: string;
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
	const { isCurrentPlan, isInSignup, planName } = props;

	if ( isInSignup ) {
		return translate( 'Start with %(plan)s', {
			args: {
				plan: planName,
			},
		} );
	}

	if ( isCurrentPlan ) {
		return props.canPurchase ? translate( 'Manage plan' ) : translate( 'View plan' );
	}

	return translate( 'Select %(plan)s', {
		args: {
			plan: planName,
		},
		context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
		comment: 'A button to select a new paid plan.',
	} );
}

export const PlansComparisonAction: React.FunctionComponent< Props > = ( {
	buttonText,
	currentSitePlanSlug,
	manageHref,
	onClick,
	planType,
	...props
} ) => {
	const translate = useTranslate();
	const className = classNames( { 'is-primary': props.isPrimary } );
	const { isCurrentPlan, isInSignup, isPlaceholder } = props;

	const handleClick = useCallback( () => {
		if ( isPlaceholder ) {
			return;
		}

		recordTracksEvent( 'calypso_plan_features_upgrade_click', {
			current_plan: currentSitePlanSlug || null,
			upgrading_to: planType,
		} );

		onClick?.();
	}, [ currentSitePlanSlug, isPlaceholder, onClick, planType ] );

	if ( ! buttonText ) {
		buttonText = getButtonText( props, translate );
	}

	if ( isInSignup || ! isCurrentPlan ) {
		manageHref = undefined;
	}

	return (
		<Button className={ className } onClick={ handleClick } href={ manageHref }>
			{ buttonText }
		</Button>
	);
};

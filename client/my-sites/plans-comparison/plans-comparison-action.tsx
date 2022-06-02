import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	TYPE_FREE,
	TYPE_FLEXIBLE,
	PLAN_WPCOM_PRO,
	PLAN_FREE,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_STARTER,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
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
	className?: string;
}

type TranslateFunc = ReturnType< typeof useTranslate >;

function getButtonText( props: Partial< Props >, translate: TranslateFunc ): TranslateResult {
	const { isCurrentPlan, plan } = props;

	const planTitle = plan?.getTitle();
	const planSlug = plan?.getStoreSlug();

	if ( planSlug === PLAN_WPCOM_PRO ) {
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

	return translate( 'Start with %(plan)s', {
		args: {
			plan: planTitle,
		},
	} );
}

const ActionButton = styled( Button )`
	display: block;
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 4px;
	font-weight: 500;
	width: 100%;

	&.is-primary,
	&.is-primary:hover {
		background: #0675c4;
		border-color: #0675c4;
	}
`;

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
	const className = classNames( { 'is-primary': props.isPrimary }, props.className );
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

		if ( [ TYPE_FLEXIBLE, TYPE_FREE ].includes( plan.type ) ) {
			return null;
		}
	}

	return (
		<ActionButton
			className={ className }
			onClick={ handleClick }
			href={ manageHref }
			disabled={ disabled }
		>
			{ buttonText }
		</ActionButton>
	);
};

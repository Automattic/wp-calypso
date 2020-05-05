/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { freePlan, defaultPaidPlan, getPlanSlugByPath, getPlanTitle } from '../../lib/plans';
import { usePlanRouteParam } from '../../path';

/**
 * Style dependencies
 */
import './style.scss';

const PlansButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );

	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const planPath = usePlanRouteParam();
	const plan = getPlanSlugByPath( planPath ) || ( hasPaidDomain ? defaultPaidPlan : freePlan );

	/* translators: Button label where %s is the WordPress.com plan name (eg: Free, Personal, Premium, Business) */
	const planLabel = sprintf( __( '%s Plan' ), getPlanTitle( plan ) );

	return (
		<Button disabled label={ __( planLabel ) } className="plans-button" { ...buttonProps }>
			{ isDesktop && planLabel }
			<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
		</Button>
	);
};

export default PlansButton;

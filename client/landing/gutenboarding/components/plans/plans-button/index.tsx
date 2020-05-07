/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import config from 'config';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import { STORE_KEY as ONBOARD_STORE } from '../../../stores/onboard';
import { STORE_KEY as PLANS_STORE } from '../../../stores/plans';

import { usePlanRouteParam } from '../../../path';
import PlansModal from '../plans-modal';

/**
 * Style dependencies
 */
import './style.scss';

const PlansButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );
	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const { setPlan } = useDispatch( PLANS_STORE );
	const defaultPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPlan( hasPaidDomain )
	);
	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	const planPath = usePlanRouteParam();
	const planFromPath = useSelect( ( select ) => select( PLANS_STORE ).getPlanByPath( planPath ) );
	const [ isPlansModalVisible, setIsPlanModalVisible ] = React.useState( false );

	const handleButtonClick = () => {
		if ( config.isEnabled( 'gutenboarding/plans-grid' ) ) {
			setIsPlanModalVisible( ( isVisible ) => ! isVisible );
		}
	};

	/**
	 * Plan is decided in this order
	 * 1. selected from PlansGrid (by dispatching setPlan)
	 * 2. having the plan slug in the URL
	 * 3. selecting a paid domain
	 */
	const plan = selectedPlan || planFromPath || defaultPlan;

	/* translators: Button label where %s is the WordPress.com plan name (eg: Free, Personal, Premium, Business) */
	const planLabel = sprintf( __( '%s Plan' ), plan.getTitle() );

	return (
		<>
			<Button
				onClick={ handleButtonClick }
				label={ __( planLabel ) }
				className="plans-button"
				{ ...buttonProps }
			>
				{ isDesktop && planLabel }
				<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
			</Button>
			<PlansModal
				isOpen={ isPlansModalVisible }
				selectedPlanSlug={ plan.getStoreSlug() }
				onConfirm={ setPlan }
				onClose={ () => setIsPlanModalVisible( false ) }
			/>
		</>
	);
};

export default PlansButton;

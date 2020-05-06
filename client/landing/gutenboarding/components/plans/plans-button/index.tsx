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
import { STORE_KEY as ONBOARD_STORE } from '../../../stores/onboard';
import {
	freePlan,
	defaultPaidPlan,
	getPlanSlugByPath,
	getPlanTitle,
	Plan,
} from '../../../lib/plans';
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

	// When no plan is selected we determine the default plan by checking the selected domain, if any
	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const defaultPlan = hasPaidDomain ? defaultPaidPlan : freePlan;

	const planPath = usePlanRouteParam();

	// @TODO: move to Onboard store once we use it for cart redirect at the end of the flow
	const [ plan, setPlan ] = React.useState< Plan | undefined >( getPlanSlugByPath( planPath ) );

	const [ isPlansModalVisible, setIsPlanModalVisible ] = React.useState( false );

	const handleModalClose = () => setIsPlanModalVisible( false );
	const handleButtonClick = () => setIsPlanModalVisible( ( isVisible ) => ! isVisible );

	/* translators: Button label where %s is the WordPress.com plan name (eg: Free, Personal, Premium, Business) */
	const planLabel = sprintf( __( '%s Plan' ), getPlanTitle( plan || defaultPlan ) );

	return (
		<>
			<Button
				label={ __( planLabel ) }
				className="plans-button"
				onClick={ handleButtonClick }
				{ ...buttonProps }
			>
				{ isDesktop && planLabel }
				<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
			</Button>
			<PlansModal
				isOpen={ isPlansModalVisible }
				currentPlan={ plan || defaultPlan }
				onConfirm={ setPlan }
				onClose={ handleModalClose }
			/>
		</>
	);
};

export default PlansButton;

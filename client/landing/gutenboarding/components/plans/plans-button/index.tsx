/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import config from 'config';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import PlansModal from '../plans-modal';
import { useSelectedPlan } from '../../../hooks/use-selected-plan';
import { useCurrentStep, Step } from '../../../path';

/**
 * Style dependencies
 */
import './style.scss';

const PlansButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();
	const currentStep = useCurrentStep();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );

	const [ isPlansModalVisible, setIsPlanModalVisible ] = React.useState( false );

	const handleButtonClick = () => {
		if ( config.isEnabled( 'gutenboarding/plans-grid' ) && Step[ currentStep ] !== 'plans' ) {
			setIsPlanModalVisible( ( isVisible ) => ! isVisible );
		}
	};

	const plan = useSelectedPlan();

	/* translators: Button label where %s is the WordPress.com plan name (eg: Free, Personal, Premium, Business) */
	const planLabel = plan ? sprintf( __( '%s Plan' ), plan.short_name ) : '';

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
			{ isPlansModalVisible && <PlansModal onClose={ () => setIsPlanModalVisible( false ) } /> }
		</>
	);
};

export default PlansButton;

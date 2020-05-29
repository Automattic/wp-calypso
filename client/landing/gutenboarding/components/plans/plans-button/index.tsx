/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import PlansModal from '../plans-modal';
import { useSelectedPlan } from '../../../hooks/use-selected-plan';
import { useCurrentStep, Step } from '../../../path';
import { Plans } from '@automattic/data-stores';

const PLANS = Plans.register();

/**
 * Style dependencies
 */
import './style.scss';

const PlansButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();
	const selectedPlan = useSelect( ( select ) => select( PLANS ).getSelectedPlan() );
	const currentStep = useCurrentStep();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );

	const [ isPlansModalVisible, setIsPlanModalVisible ] = React.useState( false );

	const handleButtonClick = () => {
		setIsPlanModalVisible( ( isVisible ) => ! isVisible );
	};

	// This hook is different from `getSelectedPlan` in the store.
	// This accounts for plans that may come from e.g. selecting a domain or adding a plan via URL
	const plan = useSelectedPlan();

	const isPlanUserSelectedOrPaid = selectedPlan || ! plan?.isFree;

	const planLabel = isPlanUserSelectedOrPaid
		? /* translators: Button label where %s is the WordPress.com plan name (eg: Personal, Premium, Business) */
		  sprintf( __( '%s Plan' ), plan?.title )
		: __( 'View plans' );

	return (
		<>
			<Button
				onClick={ handleButtonClick }
				label={ __( planLabel ) }
				disabled={ Step[ currentStep ] === 'plans' }
				className={ classnames( 'plans-button', { 'is-highlighted': isPlanUserSelectedOrPaid } ) }
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

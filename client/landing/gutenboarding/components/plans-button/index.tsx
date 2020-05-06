/**
 * External dependencies
 */
import * as React from 'react';
import { Button, Popover } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import { STORE_KEY as PLANS_STORE } from '../../stores/plans';

/**
 * Style dependencies
 */
import './style.scss';

const PlansButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const [ isOpen, setIsOpen ] = React.useState( false );
	const { __ } = useI18n();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );
	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const { setPlan } = useDispatch( PLANS_STORE );

	/* translators: Button label where %s is the WordPress.com plan name (eg: Free, Personal, Premium, Business) */
	const planLabel = sprintf( __( '%s Plan' ), selectedPlan.getTitle() );

	// This is dummy code just to test the PLANS_STORE API
	return (
		<>
			<Button
				onClick={ () => setIsOpen( ! isOpen ) }
				label={ __( planLabel ) }
				className="plans-button"
				{ ...buttonProps }
			>
				{ isDesktop && planLabel }&nbsp;
				<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
			</Button>
			{ isOpen && (
				<Popover
					onClickOutside={ () => setIsOpen( false ) }
					noArrow
					position={ 'bottom center' }
					expandOnMobile={ true }
				>
					{ supportedPlans.map( ( plan ) => (
						<Button
							style={ { display: 'block' } }
							onClick={ () => {
								setPlan( plan );
								setIsOpen( false );
							} }
							label={ __( planLabel ) }
							{ ...buttonProps }
						>
							{ plan.getTitle() }
							<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
						</Button>
					) ) }
				</Popover>
			) }
		</>
	);
};

export default PlansButton;

/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PlansGrid from '@automattic/plans-grid';
import { Title, SubTitle, ActionButtons } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../../stores/plans';
import { useTrackModal } from '../../hooks/use-track-modal';
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onClose: () => void;
}

const PlansGridModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	const plan = useSelectedPlan();
	const { domain } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const { setPlan } = useDispatch( PLANS_STORE );

	React.useEffect( () => {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}, [] );

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();

	React.useEffect( () => {
		selectedPlanRef.current = plan?.storeSlug;
	}, [ plan ] );

	useTrackModal( 'PlansGrid', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const handleConfirm = () => {
		setPlan( plan?.storeSlug );
		onClose();
	};

	const header = (
		<>
			<div>
				<Title>{ __( 'Choose a plan' ) }</Title>
				<SubTitle>
					{ __(
						'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.'
					) }
				</SubTitle>
			</div>
			<ActionButtons
				primaryButton={
					<Button isPrimary disabled={ ! plan } onClick={ handleConfirm }>
						{ __( 'Confirm' ) }
					</Button>
				}
				secondaryButton={
					<Button isLink onClick={ onClose }>
						{ __( 'Close' ) }
					</Button>
				}
			/>
		</>
	);

	return (
		<Modal
			isOpen
			className="gutenboarding-page plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
		>
			<PlansGrid currentDomain={ domain } header={ header } currentPlan={ plan } />
		</Modal>
	);
};

export default PlansGridModal;

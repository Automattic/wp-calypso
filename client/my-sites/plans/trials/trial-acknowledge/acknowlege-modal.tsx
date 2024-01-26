import { PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { HostingTrialAcknowledgement } from './hosting-acknowledge';

type TrialAcknowledgeModalProps = {
	setOpenModal: ( open: boolean ) => void;
	trialRequested?: () => void;
};

export const TrialAcknowledgeModal = ( {
	setOpenModal,
	trialRequested,
}: TrialAcknowledgeModalProps ) => {
	const { mutateAsync: addHostingTrial, isPending } = useAddHostingTrialMutation();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;

	const createTrialSite = () => {
		addHostingTrial(
			{ siteId, planSlug: PLAN_HOSTING_TRIAL_MONTHLY },
			{
				onSuccess: () => {
					setOpenModal( false );
					dispatch( initiateThemeTransfer( siteId, null, '', '', 'hosting' ) );
					trialRequested?.();
				},
				onError: () => {
					dispatch( errorNotice( __( 'Error starting your free trial.' ) ) );
				},
			}
		);
	};

	const closeModal = () => {
		if ( ! isPending ) {
			setOpenModal( false );
		}
	};

	return (
		<Modal onRequestClose={ closeModal } shouldCloseOnClickOutside={ false }>
			<HostingTrialAcknowledgement
				showFeatureList={ false }
				onStartTrialClick={ createTrialSite }
				CTAButtonState={ { isBusy: isPending, disabled: isPending } }
			/>
		</Modal>
	);
};

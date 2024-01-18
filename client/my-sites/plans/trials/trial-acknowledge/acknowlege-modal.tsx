import { PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Modal } from '@wordpress/components';
import useAddHostingTrialMutation from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { HostingTrialAcknowledgement } from './hosting-acknowledge';

type TrialAcknowledgeModalProps = {
	setOpenModal: ( open: boolean ) => void;
	trialRequested: () => void;
};

export const TrialAcknowledgeModal = ( {
	setOpenModal,
	trialRequested,
}: TrialAcknowledgeModalProps ) => {
	const { mutateAsync: addHostingTrial } = useAddHostingTrialMutation();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;

	const createTrialSite = async () => {
		setOpenModal( false );
		trialRequested();
		await addHostingTrial( { siteId, planSlug: PLAN_HOSTING_TRIAL_MONTHLY } );
		dispatch( initiateThemeTransfer( siteId, null, '', '', 'hosting' ) );
	};

	return (
		<Modal onRequestClose={ () => setOpenModal( false ) } shouldCloseOnClickOutside={ false }>
			<HostingTrialAcknowledgement
				showFeatureList={ false }
				onStartTrialClick={ createTrialSite }
			/>
		</Modal>
	);
};

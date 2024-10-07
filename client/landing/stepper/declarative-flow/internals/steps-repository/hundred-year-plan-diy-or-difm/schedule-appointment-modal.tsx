import config from '@automattic/calypso-config';
import { UserSelect } from '@automattic/data-stores';
import { Modal } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import CalendlyWidget from '../components/calendy-widget';

interface Props {
	onClose: () => void;
}

const ScheduleAppointmentModal = ( props: Props ) => {
	const { onClose } = props;

	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	return (
		<Modal size="large" onRequestClose={ () => onClose?.() }>
			<CalendlyWidget
				url={ config( '100_year_plan_calendly_id' ) }
				prefill={
					currentUser ? { name: currentUser?.display_name, email: currentUser?.email } : undefined
				}
				onSchedule={ () => {
					// TODO: submit
				} }
			/>
		</Modal>
	);
};

export default ScheduleAppointmentModal;

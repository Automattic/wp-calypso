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
		<Modal
			size="large"
			className="hundred-year-plan-schedule-appointment-modal"
			shouldCloseOnClickOutside={ false }
			onRequestClose={ () => onClose?.() }
		>
			<div className="calendly-container">
				<div className="calendly-details">
					<h2>TODO: title</h2>
					<p>
						TODO: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium
						architecto at consequuntur dolorem doloremque eaque expedita fugiat ipsum labore minus,
						nisi porro quos recusandae reprehenderit, tenetur, unde velit voluptatibus.
					</p>
				</div>
				<CalendlyWidget
					url={ config( '100_year_plan_calendly_id' ) }
					prefill={
						currentUser ? { name: currentUser?.display_name, email: currentUser?.email } : undefined
					}
					hideLandingPageDetails
					hideEventTypeDetails
					hideGdprBanner
					onSchedule={ () => {
						// TODO: submit
					} }
				/>
			</div>
		</Modal>
	);
};

export default ScheduleAppointmentModal;

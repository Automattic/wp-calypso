import config from '@automattic/calypso-config';
import { UserSelect } from '@automattic/data-stores';
import { Modal } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, captureVideo, scheduled } from '@wordpress/icons';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import CalendlyWidget from '../components/calendy-widget';
import HunderYearPlanLogo from '../hundred-year-plan-step-wrapper/hundred-year-plan-logo';

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
			__experimentalHideHeader
			onRequestClose={ () => onClose?.() }
		>
			<div className="calendly-container">
				<div className="calendly-details">
					<div className="calendly-details__header">
						<HunderYearPlanLogo />
					</div>
					<div className="calendly-details__content">
						<h3>WordPress.com 100-Year plan</h3>
						<h2>30 Minute Meeting</h2>
						<div className="calendly-details__item">
							<span className="icon">
								<Icon icon={ scheduled } size={ 28 } />
							</span>
							<strong>30 min</strong>
						</div>
						<div className="calendly-details__item">
							<span className="icon">
								<Icon icon={ captureVideo } size={ 28 } />
							</span>
							<strong>Web conferencing details provided upon confirmation.</strong>
						</div>
						<p>
							Join us for an exclusive strategy session where we’ll chart a visionary course for
							your digital evolution.
						</p>
					</div>
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

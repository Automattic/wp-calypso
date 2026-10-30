import { Outlet } from '@tanstack/react-router';
import { PageNoticesProvider } from '../components/page-layout';
import { AgencyNotices, SharedNoticesProvider } from './components/agency-notices';
import EmailVerificationNotice, { useEmailToVerify } from './components/email-verification-notice';
import WelcomeNotice, { useWelcomeNoticeEligibility } from './dashboard-opt-in/welcome-notice';
import AgencyOnboardingTour from './onboarding-tour';
import OptInPreviewPanel from './opt-in-preview';

// Pages with notices of their own get the shared ones through `AgencyNotices`.
export default function AgencyLayout() {
	const { emailToVerify, isLoading } = useEmailToVerify();
	const isWelcomeNoticeEligible = useWelcomeNoticeEligibility();

	return (
		<SharedNoticesProvider
			candidates={ [
				{
					id: 'email-verification',
					isEligible: !! emailToVerify,
					isLoading,
					notice: <EmailVerificationNotice />,
				},
				{
					id: 'new-dashboard-welcome',
					isEligible: isWelcomeNoticeEligible,
					notice: <WelcomeNotice />,
				},
			] }
		>
			<PageNoticesProvider notices={ <AgencyNotices /> }>
				<AgencyOnboardingTour>
					<Outlet />
					<OptInPreviewPanel />
				</AgencyOnboardingTour>
			</PageNoticesProvider>
		</SharedNoticesProvider>
	);
}

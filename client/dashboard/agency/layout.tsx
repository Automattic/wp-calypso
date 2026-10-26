import { Outlet } from '@tanstack/react-router';
import { PageNoticesProvider } from '../components/page-layout';
import { AgencyNotices, SharedNoticesProvider } from './components/agency-notices';
import EmailVerificationNotice, { useEmailToVerify } from './components/email-verification-notice';
import CrossoverModalHost from './crossover';
import AgencyOnboardingTour from './onboarding-tour';

// Pages with notices of their own get the shared ones through `AgencyNotices`.
export default function AgencyLayout() {
	const { emailToVerify, isLoading } = useEmailToVerify();

	return (
		<SharedNoticesProvider
			candidates={ [
				{
					id: 'email-verification',
					isEligible: !! emailToVerify,
					isLoading,
					notice: <EmailVerificationNotice />,
				},
			] }
		>
			<PageNoticesProvider notices={ <AgencyNotices /> }>
				<AgencyOnboardingTour>
					<Outlet />
				</AgencyOnboardingTour>
				<CrossoverModalHost />
			</PageNoticesProvider>
		</SharedNoticesProvider>
	);
}

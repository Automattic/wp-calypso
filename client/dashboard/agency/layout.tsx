import { Outlet } from '@tanstack/react-router';
import { PageNoticesProvider } from '../components/page-layout';
import { AgencyNotices, SharedNoticesProvider } from './components/agency-notices';
import EmailVerificationNotice, { useEmailToVerify } from './components/email-verification-notice';

/**
 * Wraps every agency page, so account-level notices show on all of them. Pages
 * with notices of their own render them through `AgencyNotices`, which adds the
 * shared ones; the rest get the shared ones from here.
 */
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
				<Outlet />
			</PageNoticesProvider>
		</SharedNoticesProvider>
	);
}

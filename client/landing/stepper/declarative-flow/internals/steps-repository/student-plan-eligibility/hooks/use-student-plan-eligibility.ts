import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type StudentPlanEligibilityReason =
	'eligible' | 'unverified' | 'not_academic' | 'already_owned';

export type StudentPlanEligibility = {
	eligible: boolean;
	reason: StudentPlanEligibilityReason;
	email_domain: string;
};

const fetchStudentPlanEligibility = (): Promise< StudentPlanEligibility > =>
	wpcom.req.get( {
		path: '/me/student-plan-eligibility',
		apiNamespace: 'wpcom/v2',
	} );

export const useStudentPlanEligibility = () =>
	useQuery( {
		queryKey: [ 'student-plan-eligibility' ],
		queryFn: fetchStudentPlanEligibility,
		// The answer changes outside this tab (an email confirmed elsewhere, a plan bought), so
		// check again on every visit and whenever the person comes back to the tab. An unconfirmed
		// email is the exception: coming back from the inbox would spend the rate-limited endpoint
		// before the confirmation lands, so `/me` watches for it and the endpoint is asked after.
		staleTime: 0,
		gcTime: 0,
		refetchOnWindowFocus: ( query ) =>
			query.state.data?.reason === 'unverified' ? false : 'always',
		// A persisted answer would be restored on the next page load and could move an account
		// forward before the fresh check comes back.
		meta: { persist: false },
		// The endpoint is rate limited; a failed check shows a retry button instead.
		retry: false,
	} );

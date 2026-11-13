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
		// check again on every visit and whenever the person comes back to the tab.
		staleTime: 0,
		gcTime: 0,
		refetchOnWindowFocus: 'always',
	} );

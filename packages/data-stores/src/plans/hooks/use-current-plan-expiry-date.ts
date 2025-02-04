import useCurrentPlan from './use-current-plan';

interface Props {
	siteId?: string | number | null;
}

const useCurrentPlanExpiryDate = ( { siteId }: Props ): Date | undefined => {
	const currentPlan = useCurrentPlan( { siteId } );

	if ( ! currentPlan || ! currentPlan?.expiry ) {
		return;
	}

	return new Date( currentPlan?.expiry );
};

export default useCurrentPlanExpiryDate;

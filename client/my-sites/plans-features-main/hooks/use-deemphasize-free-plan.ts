function useDeemphasizeFreePlan( flowName?: string | null, paidDomainName?: string ): boolean {
	return flowName === 'onboarding' && paidDomainName != null;
}

export default useDeemphasizeFreePlan;

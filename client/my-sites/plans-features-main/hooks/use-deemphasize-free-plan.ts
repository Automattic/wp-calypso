function useDeemphasizeFreePlan( flowName?: string | null, paidDomainName?: string ): boolean {
	// De-emphasize the Free plan as a CTA link on the main onboarding flow when a paid domain is picked. More context can be found in p2-p5uIfZ-f5p
	return flowName === 'onboarding' && paidDomainName != null;
}

export default useDeemphasizeFreePlan;

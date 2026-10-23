type PlansGridRedesignExperimentResult = {
	isLoading: boolean;
	/**
	 * When true, apply the redesigned pricing grid.
	 */
	usePlansGridRedesign: boolean;
	/**
	 * When true, use the redesigned plan tagline copy.
	 */
	usePlansGridRedesignNewDescription: boolean;
	/**
	 * When true, show the differentiator header (4 bullet points). Signup only.
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, use the redesigned feature list for the plan cards.
	 */
	usePlansGridRedesignFeatures: boolean;
	/**
	 * When true, show the Enterprise/VIP card at the bottom.
	 */
	showEnterpriseBottomCard: boolean;
	/**
	 * When true, show the WooCommerce card at the bottom.
	 */
	showWooCommerceBottomCard: boolean;
};

interface UsePlansGridRedesignExperimentParams {
	isInSignup: boolean;
}

function usePlansGridRedesignExperiment( {
	isInSignup,
}: UsePlansGridRedesignExperimentParams ): PlansGridRedesignExperimentResult {
	return {
		isLoading: false,
		usePlansGridRedesign: true,
		usePlansGridRedesignNewDescription: true,
		showDifferentiatorHeader: isInSignup,
		usePlansGridRedesignFeatures: true,
		showEnterpriseBottomCard: false,
		showWooCommerceBottomCard: false,
	};
}

export default usePlansGridRedesignExperiment;
export type { PlansGridRedesignExperimentResult };

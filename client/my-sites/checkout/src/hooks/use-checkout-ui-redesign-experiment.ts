// The checkout UI redesign experiment (wpcom_mobile_checkout_redesign_202603_v1) won,
// so this hook now always returns the treatment (redesigned) UI.
export function useCheckoutUiRedesignExperiment(): [ boolean, boolean ] {
	return [ false, true ];
}

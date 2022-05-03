import { useSite } from './use-site';

export function useFSEStatus() {
	const site = useSite();
	const FSEEligible = site?.is_fse_eligible;
	const FSEActive = site?.is_fse_active;
	const isLoading = !! site;

	return { FSEEligible, FSEActive, isLoading };
}

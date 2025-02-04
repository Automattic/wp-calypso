import { useQuery } from './use-query';

export function useComingFromThemeActivationParam(): boolean {
	return useQuery().get( 'comingFromThemeActivation' ) === 'true';
}

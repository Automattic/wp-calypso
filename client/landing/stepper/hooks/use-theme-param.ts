import { useQuery } from './use-query';

export function useThemeParam(): string | null {
	return useQuery().get( 'theme' );
}

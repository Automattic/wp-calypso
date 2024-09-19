import { UseQueryOptions } from '@tanstack/react-query';

const defaultQueryParams: Partial< UseQueryOptions > = {
	staleTime: 1000 * 30, // 30 seconds
	retry: 1,
	retryDelay: 3 * 1000, // 3 seconds,
	retryOnMount: false,
	refetchOnWindowFocus: false,
};

const getDefaultQueyrParams = < T1 >() => {
	return defaultQueryParams as UseQueryOptions< T1 >;
};

export default getDefaultQueyrParams;

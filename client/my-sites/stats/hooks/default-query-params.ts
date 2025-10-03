import { UseQueryOptions } from '@tanstack/react-query';

const defaultQueryParams = {
	staleTime: 1000 * 30, // 30 seconds
	retry: 1,
	retryDelay: 3 * 1000, // 3 seconds,
	retryOnMount: false,
	refetchOnWindowFocus: false,
} satisfies Partial< UseQueryOptions >;

const getDefaultQueyrParams = () => {
	return defaultQueryParams;
};

export default getDefaultQueyrParams;

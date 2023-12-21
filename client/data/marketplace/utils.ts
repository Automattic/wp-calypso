import { QueryKey } from '@tanstack/react-query';
import { PluginQueryOptions } from './types';
import { MarketplaceReviewResponse } from './use-marketplace-reviews';

const PLUGINS_CACHE_VERSION = 1;

export const getPluginsListKey = (
	key: QueryKey,
	options: PluginQueryOptions,
	infinite?: boolean
): QueryKey => {
	const keyParams = [
		options.category || '',
		options.searchTerm || '',
		options.pageSize || '',
		options.locale || '',
		options.page || '',
		infinite ? 'infinite' : '',
		options.tag && ! options.searchTerm ? options.tag : '',
	];

	return [ ...key, PLUGINS_CACHE_VERSION.toString(), ...keyParams ];
};

/**
 * Get a single avatar URL from a given review.
 * Tries to get a picture with the biggest resolution possible.
 * @param {MarketplaceReviewResponse} review the review object
 * @returns {string|undefined} the avatar URL when found
 */
export const getAvatarURL = ( review: MarketplaceReviewResponse ) => {
	return (
		review.author_avatar_urls[ '96' ] ??
		review.author_avatar_urls[ '48' ] ??
		review.author_avatar_urls[ '24' ] ??
		undefined
	);
};

export { isPhotonHost } from 'lib/post-normalizer/utils/is-photon-host';
export { imageSizeFromAttachments } from 'lib/post-normalizer/utils/image-size-from-attachments';
export { maxWidthPhotonishURL } from 'lib/post-normalizer/utils/max-width-photonish-url';
export { makeImageURLSafe } from 'lib/post-normalizer/utils/make-image-url-safe';
export { domForHtml } from 'lib/post-normalizer/utils/dom-for-html';
export { isUrlLikelyAnImage } from 'lib/post-normalizer/utils/is-url-likely-an-image';
export { thumbIsLikelyImage } from 'lib/post-normalizer/utils/thumb-is-likely-image';
export { iframeIsWhitelisted } from 'lib/post-normalizer/utils/iframe-is-whitelisted';
export { isCandidateForCanonicalImage } from 'lib/post-normalizer/utils/is-candidate-for-canonical-image';
export { isFeaturedImageInContent } from 'lib/post-normalizer/utils/is-featured-image-in-content';
export { deduceImageWidthAndHeight } from 'lib/post-normalizer/utils/deduce-image-width-and-height';

export const safeLinkRe = /^https?:\/\//;

/**
 * Only accept links that start with http or https. Reject others.
 *
 * @param {string} link the link to check
 * @returns {string|undefined} the safe link or undefined
 */
export function safeLink( link ) {
	if ( safeLinkRe.test( link ) ) {
		return link;
	}
	return undefined;
}

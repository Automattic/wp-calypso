/**
 * Mock for @wordpress/media-utils package
 */

const transformAttachment = jest.fn( ( attachment ) => ( {
	...attachment,
	transformed: true,
} ) );

export { transformAttachment };

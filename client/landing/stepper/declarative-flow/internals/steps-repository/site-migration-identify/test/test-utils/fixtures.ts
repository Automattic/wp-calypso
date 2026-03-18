import type { UrlData } from 'calypso/blocks/import/types';

export const createMockUrlData = ( overrides?: Partial< UrlData > ): UrlData => ( {
	url: 'https://example.com',
	platform: 'wordpress' as const,
	platform_data: {
		is_wpcom: false,
		is_wpengine: false,
		is_pressable: false,
	},
	meta: {
		title: 'Test Site',
		favicon: null,
	},
	...overrides,
} );

export const createWpcomUrlData = ( url = 'https://mysite.wordpress.com' ): UrlData =>
	createMockUrlData( {
		url,
		platform_data: { is_wpcom: true, is_wpengine: false, is_pressable: false },
	} );

export const createNonWpcomUrlData = ( url = 'https://example.com' ): UrlData =>
	createMockUrlData( {
		url,
		platform_data: { is_wpcom: false, is_wpengine: false, is_pressable: false },
	} );

import { selectBackupIncludesPlugin } from '../site-backups';
import type { BackupContentsResponse } from '@automattic/api-core';

const response = ( contents: BackupContentsResponse[ 'contents' ] ): BackupContentsResponse => ( {
	ok: true,
	error: '',
	contents,
} );

const pluginEntry = ( label?: string ) => ( {
	type: 'plugin' as const,
	has_children: true,
	...( label && { label } ),
} );

describe( 'selectBackupIncludesPlugin', () => {
	const selectWooSubscriptions = selectBackupIncludesPlugin( 'woocommerce-subscriptions' );

	it( 'matches the plugin directory slug', () => {
		expect(
			selectWooSubscriptions(
				response( {
					woocommerce: pluginEntry(),
					'woocommerce-subscriptions': pluginEntry(),
				} )
			)
		).toBe( true );
	} );

	it( 'matches on the slug even when the API supplies a display label', () => {
		expect(
			selectWooSubscriptions(
				response( { 'woocommerce-subscriptions': pluginEntry( 'WooCommerce Subscriptions' ) } )
			)
		).toBe( true );
	} );

	it( 'does not match a display label that is not a key', () => {
		expect(
			selectWooSubscriptions( response( { akismet: pluginEntry( 'woocommerce-subscriptions' ) } ) )
		).toBe( false );
	} );

	it( 'does not match a plugin whose slug merely contains the target', () => {
		expect(
			selectWooSubscriptions( response( { 'woocommerce-subscriptions-gifting': pluginEntry() } ) )
		).toBe( false );
	} );

	it( 'ignores case', () => {
		expect(
			selectWooSubscriptions( response( { 'WooCommerce-Subscriptions': pluginEntry() } ) )
		).toBe( true );
	} );

	it( 'returns false when the plugin is absent', () => {
		expect( selectWooSubscriptions( response( { akismet: pluginEntry() } ) ) ).toBe( false );
	} );

	it( 'returns false for an empty listing', () => {
		expect( selectWooSubscriptions( response( {} ) ) ).toBe( false );
	} );

	it( 'returns false when the request was not ok', () => {
		expect(
			selectWooSubscriptions( {
				ok: false,
				error: 'Backup not found',
				contents: { 'woocommerce-subscriptions': pluginEntry() },
			} )
		).toBe( false );
	} );
} );

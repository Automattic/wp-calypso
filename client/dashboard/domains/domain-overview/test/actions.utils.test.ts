import { DomainSubtype, type Domain } from '@automattic/api-core';
import { shouldShowTransferAction } from '../actions.utils';

const createDomain = ( overrides: Partial< Domain > = {} ): Domain =>
	( {
		domain: 'example.com',
		current_user_is_owner: true,
		is_redeemable: false,
		pending_registration: false,
		pending_registration_at_registry: false,
		move_to_new_site_pending: false,
		aftermarket_auction: false,
		can_transfer_to_any_user: true,
		can_transfer_to_other_site: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...overrides,
	} ) as Domain;

describe( 'shouldShowTransferAction', () => {
	it( 'returns false when domain cannot be transferred to any user or another site', () => {
		const domain = createDomain( {
			can_transfer_to_any_user: false,
			can_transfer_to_other_site: false,
		} );

		expect( shouldShowTransferAction( domain ) ).toBe( false );
	} );

	it( 'returns true when domain can be transferred to any user', () => {
		const domain = createDomain( {
			can_transfer_to_any_user: true,
			can_transfer_to_other_site: false,
		} );

		expect( shouldShowTransferAction( domain ) ).toBe( true );
	} );

	it( 'returns true when domain can be transferred to another site', () => {
		const domain = createDomain( {
			can_transfer_to_any_user: false,
			can_transfer_to_other_site: true,
		} );

		expect( shouldShowTransferAction( domain ) ).toBe( true );
	} );
} );

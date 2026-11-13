/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, type Domain, type Purchase } from '@automattic/api-core';
import { domainQuery, purchaseQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import Actions from '../actions';

vi.mock( '../../../app/router/domains', async () => ( {
	...( await vi.importActual< typeof import( '../../../app/router/domains' ) >(
		'../../../app/router/domains'
	) ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

function renderActions( domainProps: Partial< Domain > ) {
	const domain = {
		domain: 'example.com',
		subscription_id: '456',
		current_user_is_owner: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...domainProps,
	} as Domain;
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( domainQuery( domain.domain ).queryKey, domain );
	queryClient.setQueryData( purchaseQuery( 456 ).queryKey, { is_renewable: true } as Purchase );
	return render(
		<>
			<Actions />
			<p>Rendered</p>
		</>,
		{ queryClient }
	);
}

describe( 'domain overview actions', () => {
	test( 'shows the Danger zone heading, without Renew', async () => {
		renderActions( {} );

		expect( await screen.findByRole( 'heading', { name: 'Danger zone' } ) ).toBeVisible();
		expect( screen.queryByText( 'Renew' ) ).not.toBeInTheDocument();
	} );

	test( 'hides the section when only Renew or Transfer-in would apply', async () => {
		renderActions( {
			subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' },
			is_eligible_for_inbound_transfer: true,
			move_to_new_site_pending: true,
		} );

		await screen.findByText( 'Rendered' );
		expect( screen.queryByRole( 'heading', { name: 'Danger zone' } ) ).not.toBeInTheDocument();
	} );
} );

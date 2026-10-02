/**
 * @jest-environment jsdom
 */

import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import A4AOmnibarHelpCenter from '../omnibar-help-center';
import type { Agency } from '@automattic/api-core';

jest.mock( '@automattic/help-center', () => ( {
	__esModule: true,
	default: ( {
		product,
		newInteractionsBotSlug,
		agency,
	}: {
		product?: string;
		newInteractionsBotSlug?: string;
		agency?: { id: number; pressableId?: number } | null;
	} ) => (
		<div
			role="region"
			aria-label="Help Center"
			data-product={ product }
			data-bot-slug={ newInteractionsBotSlug }
			data-agency-id={ agency?.id }
			data-pressable-id={ agency?.pressableId }
		/>
	),
} ) );

describe( '<A4AOmnibarHelpCenter />', () => {
	afterEach( () => {
		window.history.replaceState( {}, '', '/' );
	} );

	test( 'configures the Help Center for the A4A product', async () => {
		window.history.replaceState( {}, '', '/overview?help-center=home' );
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		queryClient.setQueryData( activeAgencyQuery().queryKey, {
			id: 42,
			third_party: { pressable: { pressable_id: 7 } },
		} as Agency );

		render( <A4AOmnibarHelpCenter />, { queryClient } );

		const panel = await screen.findByRole( 'region', { name: 'Help Center' } );

		expect( panel ).toHaveAttribute( 'data-product', 'a4a' );
		expect( panel ).toHaveAttribute( 'data-bot-slug', 'automattic-chat-support_a4a' );
		expect( panel ).toHaveAttribute( 'data-agency-id', '42' );
		expect( panel ).toHaveAttribute( 'data-pressable-id', '7' );
	} );
} );

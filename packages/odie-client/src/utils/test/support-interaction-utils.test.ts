import { getOdieIdFromInteraction } from '../support-interaction-utils';
import type { SupportInteraction } from '../../types';

const buildInteraction = ( events: SupportInteraction[ 'events' ] ): SupportInteraction =>
	( {
		uuid: 'interaction-1',
		status: 'open',
		bot_slug: 'wpcom-workflow-support_chat',
		events,
	} ) as SupportInteraction;

describe( 'getOdieIdFromInteraction', () => {
	it( 'returns null when there is no interaction', () => {
		expect( getOdieIdFromInteraction( undefined ) ).toBeNull();
	} );

	it( 'returns the odie event external id', () => {
		const interaction = buildInteraction( [ { event_source: 'odie', event_external_id: '111' } ] );

		expect( getOdieIdFromInteraction( interaction ) ).toBe( '111' );
	} );

	it( 'returns the latest odie event when a legacy chat was remapped', () => {
		const interaction = buildInteraction( [
			{ event_source: 'odie', event_external_id: 'legacy-chat' },
			{ event_source: 'zendesk', event_external_id: 'zd-1' },
			{ event_source: 'odie', event_external_id: 'remapped-chat' },
		] );

		expect( getOdieIdFromInteraction( interaction ) ).toBe( 'remapped-chat' );
	} );
} );

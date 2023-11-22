/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { renderWithOdieContext } from '../.././test-utils/mock-odie';
import CustomALink from './../custom-a-link';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

describe( 'CustomALink', () => {
	it( 'calls recordTracksEvent on click', () => {
		const { getByText } = renderWithOdieContext(
			<CustomALink href="https://example.com">Test Link</CustomALink>
		);

		fireEvent.click( getByText( 'Test Link' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_odie_chat_message_action_click', {
			bot_name_slug: 'wpcom-support-chat',
			action: 'link',
			href: 'https://example.com',
		} );
	} );

	it( 'applies correct classes when inline prop is true', () => {
		const { container } = renderWithOdieContext(
			<CustomALink href="https://example.com" inline={ true }>
				Test Link
			</CustomALink>
		);

		expect( container.firstChild ).toHaveClass( 'odie-sources' );
		expect( container.firstChild ).toHaveClass( 'odie-sources-inline' );
	} );

	it( 'does not apply inline class when inline prop is false', () => {
		const { container } = renderWithOdieContext(
			<CustomALink href="https://example.com" inline={ false }>
				Test Link
			</CustomALink>
		);

		expect( container.firstChild ).toHaveClass( 'odie-sources' );
		expect( container.firstChild ).not.toHaveClass( 'odie-sources-inline' );
	} );
} );

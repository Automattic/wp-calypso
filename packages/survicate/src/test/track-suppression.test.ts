// @vitest-environment jsdom

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { type Mock, vi } from 'vitest';
import { recordSurveySuppressed } from '../track-suppression';

vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

const mockRecordTracksEvent = recordTracksEvent as Mock;

describe( 'recordSurveySuppressed', () => {
	afterEach( () => {
		mockRecordTracksEvent.mockReset();
	} );

	test( 'should record the suppression reason and trigger', () => {
		recordSurveySuppressed( 'modal', 'survey_displayed' );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_survicate_survey_suppressed', {
			reason: 'modal',
			trigger: 'survey_displayed',
		} );
	} );

	test( 'should merge extra properties into the event', () => {
		recordSurveySuppressed( 'help_center', 'invoke_event', { event_name: 'migrationCompleted' } );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_survicate_survey_suppressed', {
			reason: 'help_center',
			trigger: 'invoke_event',
			event_name: 'migrationCompleted',
		} );
	} );

	test( 'should not throw when analytics fails', () => {
		mockRecordTracksEvent.mockImplementationOnce( () => {
			throw new Error( 'analytics unavailable' );
		} );

		expect( () => recordSurveySuppressed( 'modal', 'modal_opened' ) ).not.toThrow();
	} );
} );

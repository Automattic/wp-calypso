/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import MockDate from 'mockdate';
import moment from 'moment';
import { SiteLogsPanel } from '../index.js';

jest.mock( 'lodash', () => ( {
	...jest.requireActual( 'lodash' ),
	debounce: ( fn ) => fn,
} ) );

const fromInputValidationLabel = 'Start date input validation';
const toInputValidationLabel = 'End date input validation';

async function typeDates( start, end, apply = true ) {
	await userEvent.click( screen.getByLabelText( 'Select date range' ) );

	const fromInputEl = screen.getByLabelText( 'From' );
	const toInputEl = screen.getByLabelText( 'To' );
	const applyBtnEl = screen.getByText( 'Apply' );

	await userEvent.clear( fromInputEl );
	await userEvent.type( fromInputEl, start );
	await userEvent.clear( toInputEl );
	await userEvent.type( toInputEl, end );
	expect( fromInputEl ).toHaveValue( start );
	expect( toInputEl ).toHaveValue( end );

	if ( apply ) {
		await userEvent.click( applyBtnEl );
	}
}

function getWebServerLogsCardProps() {
	return {
		siteId: 123456,
		siteSlug: 'example.com',
		isAtomicSiteLogAccessEnabled: true,
		atomicLogsDownloadStarted: () => {},
		atomicLogsDownloadCompleted: () => {},
		atomicLogsDownloadError: () => {},
		successNotice: () => {},
		errorNotice: () => {},
		translate,
	};
}

// May is till 31
const format = 'MM/DD/YYYY';
const startDate = '05/26/2018';
const today = '06/01/2018';

describe( 'WebServerLogsCard', () => {
	beforeEach( () => {
		// Mock matchMedia
		window.matchMedia = jest.fn().mockImplementation( ( query ) => {
			return {
				matches: true,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );

		// Set the clock for our test assertions so that new Date()
		// will return a known deterministic date. This important
		// for the component to render the expected calendars when
		// an initial date is not passed to it in a test.
		MockDate.set( moment.utc( today, format ) );
	} );

	afterEach( () => {
		MockDate.reset();
	} );

	test( 'Initial dates should have 1 week range.', async () => {
		render( <SiteLogsPanel { ...getWebServerLogsCardProps() } /> );

		expect( screen.getByLabelText( 'Date range' ) ).toHaveTextContent(
			`${ startDate } - ${ today }`
		);
	} );
	test( 'displays an error message if start date is not valid', async () => {
		render( <SiteLogsPanel { ...getWebServerLogsCardProps() } /> );
		const start = 'invalid-date';
		const end = today;
		const startText = 'Start date format is not valid';
		const endText = 'Date is valid';

		await typeDates( start, end, false );

		expect( screen.getByLabelText( fromInputValidationLabel ) ).toHaveTextContent( startText );
		expect( screen.getByLabelText( toInputValidationLabel ) ).toHaveTextContent( endText );
	} );

	test( 'displays an error message if end date is not valid', async () => {
		render( <SiteLogsPanel { ...getWebServerLogsCardProps() } /> );
		const start = startDate;
		const end = 'invalid-date';
		const startText = 'Date is valid';
		const endText = 'End date format is not valid';

		await typeDates( start, end, false );

		expect( screen.getByLabelText( fromInputValidationLabel ) ).toHaveTextContent( startText );
		expect( screen.getByLabelText( toInputValidationLabel ) ).toHaveTextContent( endText );
	} );

	test( 'displays an error message if start date is more than 14 days ago', async () => {
		render( <SiteLogsPanel { ...getWebServerLogsCardProps() } /> );

		const date14DaysAgo = moment.utc( today, format ).subtract( 2, 'week' );

		const start = date14DaysAgo.format( format );
		const end = today;
		const startText = 'Start date must be less than 14 days ago.';
		const endText = 'Date is valid';

		await typeDates( start, end, false );

		expect( screen.getByLabelText( fromInputValidationLabel ) ).toHaveTextContent( startText );
		expect( screen.getByLabelText( toInputValidationLabel ) ).toHaveTextContent( endText );
	} );

	test( 'displays an error message if start date is after end date', async () => {
		render( <SiteLogsPanel { ...getWebServerLogsCardProps() } /> );

		const date14DaysAfter = moment.utc( today, format ).add( 2, 'week' );

		const start = date14DaysAfter.format( format );
		const end = today;
		const startText = 'Start date must be earlier than end date.';
		const endText = 'Date is valid';

		await typeDates( start, end, false );

		expect( screen.getByLabelText( fromInputValidationLabel ) ).toHaveTextContent( startText );
		expect( screen.getByLabelText( toInputValidationLabel ) ).toHaveTextContent( endText );
	} );
} );

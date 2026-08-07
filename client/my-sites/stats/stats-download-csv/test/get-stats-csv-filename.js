import moment from 'moment';
import { getStatsCsvFileName } from '../get-stats-csv-filename';

describe( 'getStatsCsvFileName', () => {
	const siteSlug = 'mercantile.wordpress.org';
	const path = 'posts';

	beforeAll( () => {
		moment.locale( 'en' );
	} );

	it( 'uses the selected custom date range for multi-month exports (STATS-420)', () => {
		// Period object still reflects a single month unit around the start date,
		// which previously produced filenames like posts-month-01/01/2026-01/31/2026.
		// query.period is forced to 'day' for custom ranges and is omitted from the filename.
		const period = {
			period: 'month',
			startOf: moment( '2026-01-01' ),
			endOf: moment( '2026-01-31' ),
		};
		const query = {
			period: 'day',
			start_date: '2026-01-01',
			date: '2026-08-06',
			summarize: 1,
		};

		expect( getStatsCsvFileName( { siteSlug, path, period, query } ) ).toBe(
			'mercantile.wordpress.org-posts-01/01/2026-08/06/2026.csv'
		);
	} );

	it( 'uses the selected custom date range for a single-month export (STATS-420)', () => {
		// A day-period unit around the start date previously produced
		// posts-day-01/01/2026-01/01/2026 for a Jan 1–31 selection.
		const period = {
			period: 'day',
			startOf: moment( '2026-01-01' ),
			endOf: moment( '2026-01-01' ),
		};
		const query = {
			period: 'day',
			start_date: '2026-01-01',
			date: '2026-01-31',
			summarize: 1,
		};

		expect( getStatsCsvFileName( { siteSlug, path, period, query } ) ).toBe(
			'mercantile.wordpress.org-posts-01/01/2026-01/31/2026.csv'
		);
	} );

	it( 'falls back to period bounds when no custom date range is present', () => {
		const period = {
			period: 'month',
			startOf: moment( '2026-01-01' ),
			endOf: moment( '2026-01-31' ),
		};
		const query = {
			period: 'month',
			date: '2026-01-31',
		};

		expect( getStatsCsvFileName( { siteSlug, path, period, query } ) ).toBe(
			'mercantile.wordpress.org-posts-month-01/01/2026-01/31/2026.csv'
		);
	} );

	it( 'omits the period and date segments when includeDates is false', () => {
		const period = {
			period: 'day',
			startOf: moment( '2026-08-06' ),
			endOf: moment( '2026-08-06' ),
		};
		const query = { quantity: 30 };

		expect(
			getStatsCsvFileName( { siteSlug, path: 'emails', period, query, includeDates: false } )
		).toBe( 'mercantile.wordpress.org-emails.csv' );
	} );

	it( 'falls back to period bounds when query is omitted', () => {
		const period = {
			period: 'week',
			startOf: moment( '2026-01-05' ),
			endOf: moment( '2026-01-11' ),
		};

		expect( getStatsCsvFileName( { siteSlug, path, period } ) ).toBe(
			'mercantile.wordpress.org-posts-week-01/05/2026-01/11/2026.csv'
		);
	} );
} );

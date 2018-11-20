/**
 * Internal dependencies
 */
import { newPost } from '../support/utils';

describe( 'Datepicker', () => {
	beforeEach( async () => {
		await newPost();
	} );

	it( 'should show the publishing date as "Immediately" if the date is not altered', async () => {
		const publishingDate = await page.$eval(
			'.edit-post-post-schedule__toggle',
			( dateLabel ) => dateLabel.textContent
		);

		expect( publishingDate ).toEqual( 'Immediately' );
	} );

	it( 'should show the publishing date if the date is in the past', async () => {
		// Open the datepicker.
		await page.click( '.edit-post-post-schedule__toggle' );

		// Change the publishing date to a year in the past.
		await page.click( '.components-datetime__time-field-year' );
		await page.keyboard.press( 'ArrowDown' );

		// Close the datepicker.
		await page.click( '.edit-post-post-schedule__toggle' );

		const publishingDate = await page.$eval(
			'.edit-post-post-schedule__toggle',
			( dateLabel ) => dateLabel.textContent
		);

		expect( publishingDate ).toMatch( /[A-Za-z]{3} \d{1,2}, \d{4} \d{1,2}:\d{2} [ap]m/ );
	} );

	it( 'should show the publishing date if the date is in the future', async () => {
		// Open the datepicker.
		await page.click( '.edit-post-post-schedule__toggle' );

		// Change the publishing date to a year in the future.
		await page.click( '.components-datetime__time-field-year' );
		await page.keyboard.press( 'ArrowUp' );

		// Close the datepicker.
		await page.click( '.edit-post-post-schedule__toggle' );

		const publishingDate = await page.$eval(
			'.edit-post-post-schedule__toggle',
			( dateLabel ) => dateLabel.textContent
		);

		expect( publishingDate ).not.toEqual( 'Immediately' );
		// The expected date format will be "Sep 26, 2018 11:52 pm".
		expect( publishingDate ).toMatch( /[A-Za-z]{3} \d{1,2}, \d{4} \d{1,2}:\d{2} [ap]m/ );
	} );
} );

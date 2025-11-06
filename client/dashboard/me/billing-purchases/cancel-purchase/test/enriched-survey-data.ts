import enrichedSurveyData from '../enriched-survey-data';
import type { Purchase } from '@automattic/api-core';

describe( 'enrichedSurveyData', () => {
	test( 'should duplicate survey data if no site or purchase are provided', () => {
		expect( enrichedSurveyData( { key: 'value' } ) ).toEqual( {
			key: 'value',
			purchase: '',
			purchaseId: 0,
		} );
	} );

	test( 'should add purchase id and slug to survey data if purchase is provided', () => {
		const purchase = { product_slug: 'product slug' } as Purchase;
		expect( enrichedSurveyData( { key: 'value' }, purchase ).purchase ).toEqual( 'product slug' );
	} );

	test( 'should add daysSincePurchase to survey data when purchase.subscribed_date is provided', () => {
		const purchase = { subscribed_date: '2017-01-09T03:00:00+00:00' } as Purchase;
		expect(
			enrichedSurveyData( {}, purchase, new Date( '2017-01-19T03:00:00+00:00' ) ).daysSincePurchase
		).toEqual( 10 );
	} );

	test( 'should add daysSinceSiteCreation to survey data when purchase.blog_created_date is provided', () => {
		const purchase = {
			blog_created_date: '2017-01-09T03:00:00+00:00',
		} as Purchase;
		expect(
			enrichedSurveyData( {}, purchase, new Date( '2017-01-19T03:00:00+00:00' ) )
				.daysSinceSiteCreation
		).toEqual( 10 );
	} );
} );

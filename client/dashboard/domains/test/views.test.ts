import { recordDomainViewChanges } from '../dataviews/views';
import type { View } from '@wordpress/dataviews';

describe( 'recordDomainViewChanges', () => {
	test( 'nothing relevant changed', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			page: 1,
			fields: [ 'blog_name', 'domain_status' ],
			filters: [ { field: 'blog_name', value: 'hello', operator: 'is' } ],
		};
		const newView: View = {
			type: 'table',
			page: 2,
			fields: [ 'domain_status', 'blog_name' ],
			filters: [ { field: 'blog_name', value: 'new value', operator: 'isNot' } ],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).not.toHaveBeenCalled();
	} );

	test( 'add new field', () => {
		const tracks = jest.fn();
		const oldView: View = { type: 'table' };
		const newView: View = {
			type: 'table',
			fields: [ 'blog_name' ],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'added',
				field: 'blog_name',
			}
		);
	} );

	test( 'add multiple new fields', () => {
		const tracks = jest.fn();
		const oldView: View = { type: 'table', fields: [ 'blog_name' ] };
		const newView: View = {
			type: 'table',
			fields: [ 'blog_name', 'ssl_status', 'expiry' ],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'added',
				field: 'ssl_status',
			}
		);
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'added',
				field: 'expiry',
			}
		);
	} );

	test( 'remove field', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			fields: [ 'blog_name' ],
		};
		const newView: View = { type: 'table' };

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'blog_name',
			}
		);
	} );

	test( 'remove multiple fields', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			fields: [ 'blog_name', 'ssl_status', 'expiry' ],
		};
		const newView: View = { type: 'table', fields: [ 'blog_name' ] };

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'ssl_status',
			}
		);
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'expiry',
			}
		);
	} );

	test( 'add/remove fields', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			fields: [ 'blog_name', 'ssl_status' ],
		};
		const newView: View = {
			type: 'table',
			fields: [ 'expiry', 'blog_name' ],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'added',
				field: 'expiry',
			}
		);
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'ssl_status',
			}
		);
	} );

	test( 'add new filters', () => {
		const tracks = jest.fn();
		const oldView: View = { type: 'table' };
		const newView: View = {
			type: 'table',
			filters: [ { field: 'domain_status', value: 'active', operator: 'is' } ],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'added',
			field: 'domain_status',
		} );
	} );

	test( 'add multiple new filters', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			filters: [ { field: 'domain_status', value: 'active', operator: 'is' } ],
		};
		const newView: View = {
			type: 'table',
			filters: [
				{ field: 'domain_status', value: 'active', operator: 'is' },
				{ field: 'ssl_status', value: 'active', operator: 'is' },
				{ field: 'blog_name', value: 'active', operator: 'is' },
			],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'added',
			field: 'ssl_status',
		} );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'added',
			field: 'blog_name',
		} );
	} );

	test( 'remove filter', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			filters: [ { field: 'domain_status', value: 'active', operator: 'is' } ],
		};
		const newView: View = { type: 'table' };

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'removed',
			field: 'domain_status',
		} );
	} );

	test( 'remove multiple filters', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			filters: [
				{ field: 'domain_status', value: 'active', operator: 'is' },
				{ field: 'ssl_status', value: 'active', operator: 'is' },
				{ field: 'blog_name', value: 'active', operator: 'is' },
			],
		};
		const newView: View = {
			type: 'table',
			filters: [ { field: 'domain_status', value: 'active', operator: 'is' } ],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'removed',
			field: 'ssl_status',
		} );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'removed',
			field: 'blog_name',
		} );
	} );

	test( 'add/remove filters', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			filters: [
				{ field: 'domain_status', value: 'active', operator: 'is' },
				{ field: 'blog_name', value: 'active', operator: 'is' },
			],
		};
		const newView: View = {
			type: 'table',
			filters: [
				{ field: 'ssl_status', value: 'active', operator: 'is' },
				{ field: 'domain_status', value: 'active', operator: 'is' },
			],
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'added',
			field: 'ssl_status',
		} );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'removed',
			field: 'blog_name',
		} );
	} );

	test( 'sort direction change', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			sort: { field: 'domain', direction: 'asc' },
		};
		const newView: View = {
			type: 'table',
			sort: { field: 'domain', direction: 'desc' },
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_sort_changed', {
			field: 'domain',
			direction: 'desc',
		} );
	} );

	test( 'sort field change', () => {
		const tracks = jest.fn();
		const oldView: View = {
			type: 'table',
			sort: { field: 'expiry', direction: 'asc' },
		};
		const newView: View = {
			type: 'table',
			sort: { field: 'domain', direction: 'desc' },
		};

		recordDomainViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_domains_view_sort_changed', {
			field: 'domain',
			direction: 'desc',
		} );
	} );
} );

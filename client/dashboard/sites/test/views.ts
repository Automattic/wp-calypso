import { recordViewChanges } from '../dataviews/views';
import type { SitesView } from '@automattic/api-core';

describe( 'recordViewChanges', () => {
	test( 'nothing relevant changed', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			page: 1,
			fields: [ 'name', 'status' ],
			filters: [ { field: 'name', value: 'hello', operator: 'is' } ],
		};
		const newView: SitesView = {
			type: 'grid',
			page: 2,
			fields: [ 'status', 'name' ],
			filters: [ { field: 'name', value: 'new value', operator: 'isNot' } ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).not.toHaveBeenCalled();
	} );

	test( 'add new field', () => {
		const tracks = jest.fn();
		const oldView: SitesView = { type: 'grid' };
		const newView: SitesView = {
			type: 'grid',
			fields: [ 'name' ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'added',
				field: 'name',
			}
		);
	} );

	test( 'add multiple new fields', () => {
		const tracks = jest.fn();
		const oldView: SitesView = { type: 'grid', fields: [ 'name' ] };
		const newView: SitesView = {
			type: 'grid',
			fields: [ 'name', 'url', 'status' ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'added',
				field: 'url',
			}
		);
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'added',
				field: 'status',
			}
		);
	} );

	test( 'remove field', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			fields: [ 'name' ],
		};
		const newView: SitesView = { type: 'grid' };

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'name',
			}
		);
	} );

	test( 'remove multiple fields', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			fields: [ 'name', 'url', 'status' ],
		};
		const newView: SitesView = { type: 'grid', fields: [ 'name' ] };

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'url',
			}
		);
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'status',
			}
		);
	} );

	test( 'add/remove fields', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			fields: [ 'name', 'url' ],
		};
		const newView: SitesView = {
			type: 'grid',
			fields: [ 'media', 'name' ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'added',
				field: 'media',
			}
		);
		expect( tracks ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			{
				change: 'removed',
				field: 'url',
			}
		);
	} );

	test( 'add new filters', () => {
		const tracks = jest.fn();
		const oldView: SitesView = { type: 'grid' };
		const newView: SitesView = {
			type: 'grid',
			filters: [ { field: 'status', value: 'active', operator: 'is' } ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'added',
			field: 'status',
		} );
	} );

	test( 'add multiple new filters', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			filters: [ { field: 'status', value: 'active', operator: 'is' } ],
		};
		const newView: SitesView = {
			type: 'grid',
			filters: [
				{ field: 'status', value: 'active', operator: 'is' },
				{ field: 'url', value: 'active', operator: 'is' },
				{ field: 'name', value: 'active', operator: 'is' },
			],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'added',
			field: 'url',
		} );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'added',
			field: 'name',
		} );
	} );

	test( 'remove filter', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			filters: [ { field: 'status', value: 'active', operator: 'is' } ],
		};
		const newView: SitesView = { type: 'grid' };

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 1 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'removed',
			field: 'status',
		} );
	} );

	test( 'remove multiple filters', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			filters: [
				{ field: 'status', value: 'active', operator: 'is' },
				{ field: 'url', value: 'active', operator: 'is' },
				{ field: 'name', value: 'active', operator: 'is' },
			],
		};
		const newView: SitesView = {
			type: 'grid',
			filters: [ { field: 'status', value: 'active', operator: 'is' } ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'removed',
			field: 'url',
		} );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'removed',
			field: 'name',
		} );
	} );

	test( 'add/remove filters', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			filters: [
				{ field: 'status', value: 'active', operator: 'is' },
				{ field: 'name', value: 'active', operator: 'is' },
			],
		};
		const newView: SitesView = {
			type: 'grid',
			filters: [
				{ field: 'media', value: 'active', operator: 'is' },
				{ field: 'status', value: 'active', operator: 'is' },
			],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledTimes( 2 );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'added',
			field: 'media',
		} );
		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'removed',
			field: 'name',
		} );
	} );

	test( 'view type change', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			fields: [ 'name', 'status' ],
		};
		const newView: SitesView = {
			type: 'table',
			fields: [ 'name', 'visitors' ],
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_type_changed', {
			type: 'table',
		} );
		expect( tracks ).not.toHaveBeenCalledWith(
			'calypso_dashboard_sites_view_field_visibility_changed',
			expect.anything()
		);
	} );

	test( 'sort direction change', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			sort: { field: 'name', direction: 'asc' },
		};
		const newView: SitesView = {
			type: 'grid',
			sort: { field: 'name', direction: 'desc' },
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_sort_changed', {
			field: 'name',
			direction: 'desc',
		} );
	} );

	test( 'sort field change', () => {
		const tracks = jest.fn();
		const oldView: SitesView = {
			type: 'grid',
			sort: { field: 'status', direction: 'asc' },
		};
		const newView: SitesView = {
			type: 'grid',
			sort: { field: 'name', direction: 'desc' },
		};

		recordViewChanges( oldView, newView, tracks );

		expect( tracks ).toHaveBeenCalledWith( 'calypso_dashboard_sites_view_sort_changed', {
			field: 'name',
			direction: 'desc',
		} );
	} );
} );

import AsyncLoad from 'calypso/components/async-load';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

const analyticsPageTitle = 'Reader';

export const createList = ( context, next ) => {
	const basePath = '/reader/list/new';
	const fullAnalyticsPageTitle = `${ analyticsPageTitle } > List > Create`;
	const mcKey = 'list';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_list_create_loaded' );

	context.primary = (
		<AsyncLoad require="calypso/reader/list-manage" key="list-manage" isCreateForm />
	);
	next();
};

export const listListing = ( context, next ) => {
	const basePath = '/reader/list/:owner/:slug';
	const fullAnalyticsPageTitle =
		analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list;
	const mcKey = 'list';
	const streamKey =
		'list:' + JSON.stringify( { owner: context.params.user, slug: context.params.list } );
	const state = context.store.getState();

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack(
		'calypso_reader_list_loaded',
		{
			list_owner: context.params.user,
			list_slug: context.params.list,
		},
		{ pathnameOverride: getCurrentRoute( state ) }
	);

	context.primary = (
		<AsyncLoad
			require="calypso/reader/list-stream"
			key={ 'tag-' + context.params.user + '-' + context.params.list }
			streamKey={ streamKey }
			owner={ encodeURIComponent( context.params.user ) }
			slug={ encodeURIComponent( context.params.list ) }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
		/>
	);
	next();
};

export const editList = ( context, next ) => {
	const basePath = '/reader/list/:owner/:slug/edit';
	const fullAnalyticsPageTitle = `${ analyticsPageTitle } > List > ${ context.params.user } - ${ context.params.list } > Edit`;
	const mcKey = 'list';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_list_edit_loaded', {
		list_owner: context.params.user,
		list_slug: context.params.list,
	} );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/list-manage"
			key="list-manage"
			owner={ encodeURIComponent( context.params.user ) }
			slug={ encodeURIComponent( context.params.list ) }
			selectedSection="details"
		/>
	);
	next();
};

export const editListItems = ( context, next ) => {
	const basePath = '/reader/list/:owner/:slug/edit/items';
	const fullAnalyticsPageTitle = `${ analyticsPageTitle } > List > ${ context.params.user } - ${ context.params.list } > Edit > Items`;
	const mcKey = 'list';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_list_edit_items_loaded', {
		list_owner: context.params.user,
		list_slug: context.params.list,
	} );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/list-manage"
			key="list-manage"
			owner={ encodeURIComponent( context.params.user ) }
			slug={ encodeURIComponent( context.params.list ) }
			selectedSection="items"
		/>
	);
	next();
};

export const exportList = ( context, next ) => {
	const basePath = '/reader/list/:owner/:slug/export';
	const fullAnalyticsPageTitle = `${ analyticsPageTitle } > List > ${ context.params.user } - ${ context.params.list } > Edit > Export`;
	const mcKey = 'list';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_list_export_loaded', {
		list_owner: context.params.user,
		list_slug: context.params.list,
	} );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/list-manage"
			key="list-manage"
			owner={ encodeURIComponent( context.params.user ) }
			slug={ encodeURIComponent( context.params.list ) }
			selectedSection="export"
		/>
	);
	next();
};

export const deleteList = ( context, next ) => {
	const basePath = '/reader/list/:owner/:slug/delete';
	const fullAnalyticsPageTitle = `${ analyticsPageTitle } > List > ${ context.params.user } - ${ context.params.list } > Edit > Delete`;
	const mcKey = 'list';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_list_delete_loaded', {
		list_owner: context.params.user,
		list_slug: context.params.list,
	} );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/list-manage"
			key="list-manage"
			owner={ encodeURIComponent( context.params.user ) }
			slug={ encodeURIComponent( context.params.list ) }
			selectedSection="delete"
		/>
	);
	next();
};

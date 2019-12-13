/**
 * Internal dependencies
 */
import getLastNonEditorRoute from 'state/selectors/get-last-non-editor-route';
import { ROUTE_SET } from 'state/action-types';

function getRouteAndActionLogState( previousPath, actionLogPath ) {
	return {
		ui: {
			route: {
				path: {
					previous: previousPath,
				},
			},
			actionLog: [
				{ type: ROUTE_SET, path: actionLogPath },
				{ type: ROUTE_SET, path: previousPath },
			],
		},
	};
}

describe( 'getLastNonEditorRoute()', () => {
	test( 'should return last path from action log for block editor route', () => {
		const previousPath = '/block-editor/page/my-test-site.wordpress.com/2';
		const actionLogPath = '/action-log-path';
		const state = getRouteAndActionLogState( previousPath, actionLogPath );
		expect( getLastNonEditorRoute( state ) ).toEqual( actionLogPath );
	} );

	test( 'should return last path from action log for legacy editor page route', () => {
		const previousPath = '/page/my-test-site.wordpress.com';
		const actionLogPath = '/action-log-path';
		const state = getRouteAndActionLogState( previousPath, actionLogPath );
		expect( getLastNonEditorRoute( state ) ).toEqual( actionLogPath );
	} );

	test( 'should return last path from action log for legacy editor post route', () => {
		const previousPath = '/post/my-test-site.wordpress.com';
		const actionLogPath = '/action-log-path';
		const state = getRouteAndActionLogState( previousPath, actionLogPath );
		expect( getLastNonEditorRoute( state ) ).toEqual( actionLogPath );
	} );

	test( 'should return previousPath for pages route', () => {
		const previousPath = '/pages/my-test-site.wordpress.com';
		const actionLogPath = '/action-log-path';
		const state = getRouteAndActionLogState( previousPath, actionLogPath );
		expect( getLastNonEditorRoute( state ) ).toEqual( previousPath );
	} );

	test( 'should return previousPath for posts route', () => {
		const previousPath = '/posts/my-test-site.wordpress.com';
		const actionLogPath = '/action-log-path';
		const state = getRouteAndActionLogState( previousPath, actionLogPath );
		expect( getLastNonEditorRoute( state ) ).toEqual( previousPath );
	} );

	test( 'should return previousPath for home route', () => {
		const previousPath = '/home/my-test-site.wordpress.com';
		const actionLogPath = '/action-log-path';
		const state = getRouteAndActionLogState( previousPath, actionLogPath );
		expect( getLastNonEditorRoute( state ) ).toEqual( previousPath );
	} );
} );

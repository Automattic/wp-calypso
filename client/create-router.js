import Router5 from 'router5';
import historyPlugin from 'router5-history';
import linkInterceptor from 'router5-link-interceptor';
import sections from 'sections';

export function createRouter() {
	const router = new Router5();

	router.add( sections.get().map( s => ( { name: s.name, path: s.paths[0], module: s.module } ) ) );
	router.usePlugin( historyPlugin() );
	router.useMiddleware( ensureMiddleware );

	function callback( err ) {
		console.log( 'intercepting link…' );
		if ( err ) {
			console.log( err );
		}
	}

	router.usePlugin( linkInterceptor( {}, callback ) );

	return router;
}

export function ensureMiddleware( /* router */ ) {
	return ( toState, fromState, done ) => {
		const isSection = sectionName => sections.get().filter( s => s.name === sectionName );
		console.log( 'toState', toState, 'fromState', fromState, 'done', done );
		if ( isSection( toState.name ) ) {
			console.log( 'preloading', toState.name );
			sections.preload( toState.name );
		}
		done && done();
	};
}

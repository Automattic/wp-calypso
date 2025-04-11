import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import './style.scss';
import Layout from './layout';
import { persistPromise } from './query-client';
import type { AppType, AppConfig } from './context';

function boot( app: AppType, config: AppConfig ) {
	const rootElement = document.getElementById( 'wpcom' );
	if ( rootElement === null ) {
		throw new Error( 'No root element found' );
	}
	const root = createRoot( rootElement );

	persistPromise.then( () => {
		root.render( <Layout app={ app } config={ config } /> );
	} );
}

export default boot;

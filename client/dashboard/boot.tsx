import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import './style.scss';
import App from './app';
import { persistPromise } from './app/query-client';
import { AppProvider, AppType } from './app-context';

function boot( app: AppType ) {
	const rootElement = document.getElementById( 'wpcom' );
	if ( rootElement === null ) {
		throw new Error( 'No root element found' );
	}
	const root = createRoot( rootElement );

	persistPromise.then( () => {
		root.render(
			<AppProvider appType={ app }>
				<App />
			</AppProvider>
		);
	} );
}

export default boot;

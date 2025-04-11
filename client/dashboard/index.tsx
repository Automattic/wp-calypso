import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import './themes/dotcom.scss';
import './style.scss';
import Layout from './layout';
import { persistPromise } from './layout/query-client';

const rootElement = document.getElementById( 'wpcom' );
if ( rootElement === null ) {
	throw new Error( 'No root element found' );
}
const root = createRoot( rootElement );

persistPromise.then( () => {
	root.render( <Layout /> );
} );

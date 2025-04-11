import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import '../themes/a4a.scss';
import '../style.scss';
import { persistPromise } from '../layout/query-client';
import A4AApp from './app';

const rootElement = document.getElementById( 'wpcom' );
if ( rootElement === null ) {
	throw new Error( 'No root element found' );
}
const root = createRoot( rootElement );

persistPromise.then( () => {
	root.render( <A4AApp /> );
} );

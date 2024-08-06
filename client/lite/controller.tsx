import { Container, createRoot } from 'react-dom/client';
import About from './about';
import App from './app';
import Layout from './layout';

export function makeLayout( context, next ) {
	context.layout = <Layout primary={ context.primary } secondary={ context.secondary } />;
	next();
}

export function clientRender( context, next ) {
	const root = createRoot( document.getElementById( 'calypso' ) as Container );
	root.render( context.layout );
	next();
}

export function renderHome( context, next ) {
	context.primary = <App />;
	next();
}

export function renderAbout( context, next ) {
	context.primary = <About />;
	next();
}

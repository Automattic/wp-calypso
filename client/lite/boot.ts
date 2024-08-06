import '@automattic/calypso-polyfills';
import page from 'page';
import { renderHome, renderAbout, makeLayout, clientRender } from './controller';

page( '/about', renderAbout, makeLayout, clientRender );
page( '/', renderHome, makeLayout, clientRender );

window.onload = () => {
	page.start();
};

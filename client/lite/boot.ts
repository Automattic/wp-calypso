import '@automattic/calypso-polyfills';
import page from '@automattic/calypso-router';
import { renderHome, renderAbout, makeLayout, clientRender } from './controller';

page( '/about', renderAbout, makeLayout, clientRender );
page( '/', renderHome, makeLayout, clientRender );

window.onload = () => {
	page.start();
};

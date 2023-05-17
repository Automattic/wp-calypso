import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';

const redirectToHelp = () => {
	page.redirect( '/help' );
};

export default () => {
	page( '/me/chat', sidebar, redirectToHelp, makeLayout, clientRender );
};

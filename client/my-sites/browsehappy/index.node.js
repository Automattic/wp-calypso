/**
 * Internal dependencies
 */
import { makeLayout } from 'controller';
import {
	renderBrowseHappy,
	redirectToSignup,
	redirectToInvite
} from './controller';

export default function( router ) {
	router( '/browsehappy/:site_id?',
		setJadeTemplate,
		redirectToSignup,
		redirectToInvite,
		renderBrowseHappy,
		makeLayout
	);
}

function setJadeTemplate( context, next ) {
	context.template = 'browsehappy.jade';
	next();
}

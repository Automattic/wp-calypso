import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import controller from './controller';

import './style.scss';

export default function () {
	// not putting category or email address in params, since `page`
	// currently double-decodes the URI before doing route matching
	// https://github.com/visionmedia/page.js/issues/306
	page( '/mailing-lists/unsubscribe', controller.unsubscribe, makeLayout, clientRender );
}

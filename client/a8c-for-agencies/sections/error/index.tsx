import page from '@automattic/calypso-router';
import { render as clientRender } from 'calypso/controller/web-util';
import { errorContext } from './controller';

export default function () {
	page( '/error', errorContext, clientRender );
}

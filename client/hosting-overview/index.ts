import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import hostingOverview from './controller';

export default function () {
	page( '/hosting-overview', hostingOverview, makeLayout, clientRender );
}

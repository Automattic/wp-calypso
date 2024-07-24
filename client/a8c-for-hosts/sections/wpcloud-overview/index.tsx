import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-hosts/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { wpcloudOverviewContext } from './controller';

export default function () {
	page( '/wpcloud', requireAccessContext, wpcloudOverviewContext, makeLayout, clientRender );
}

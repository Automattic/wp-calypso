import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-hosts/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { wpcloudSupportContext } from './controller';

export default function () {
	page( '/wpcloud/support', requireAccessContext, wpcloudSupportContext, makeLayout, clientRender );
}

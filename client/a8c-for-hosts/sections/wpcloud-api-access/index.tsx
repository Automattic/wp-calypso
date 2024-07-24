import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-hosts/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { wpcloudApiAccessContext } from './controller';

export default function () {
	page(
		'/wpcloud/api-access',
		requireAccessContext,
		wpcloudApiAccessContext,
		makeLayout,
		clientRender
	);
}

import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-hosts/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { wpcloudInsightsContext } from './controller';

export default function () {
	page(
		'/wpcloud/insights',
		requireAccessContext,
		wpcloudInsightsContext,
		makeLayout,
		clientRender
	);
}

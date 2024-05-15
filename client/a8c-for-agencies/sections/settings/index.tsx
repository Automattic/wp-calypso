import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { settingsContext } from './controller';

export default function () {
	page( '/settings', requireAccessContext, settingsContext, makeLayout, clientRender );
}

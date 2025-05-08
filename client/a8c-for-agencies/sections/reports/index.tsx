import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { reportsContext } from './controller';

export default function () {
	page( '/reports', requireAccessContext, reportsContext, makeLayout, clientRender );
}

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { settingsContext } from './controller';

export default function () {
	page( '/settings', settingsContext, makeLayout, clientRender );
}

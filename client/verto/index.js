import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { verto } from './controller';

export default function () {
	page( '/verto', verto, makeLayout, clientRender );
}

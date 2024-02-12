import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { a8cForAgenciesContext } from './controller';

export default function () {
	page( '/', a8cForAgenciesContext, makeLayout, clientRender );
}

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { landingContext } from './controller';

export default function () {
	page( '/landing', landingContext, makeLayout, clientRender );
}

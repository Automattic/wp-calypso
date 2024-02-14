import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { usersContext } from './controller';

export default function () {
	page( '/users', usersContext, makeLayout, clientRender );
}

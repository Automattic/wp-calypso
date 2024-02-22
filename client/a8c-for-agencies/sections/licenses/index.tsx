import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { licensesContext } from './controller';

export default function () {
	page( '/licenses', licensesContext, makeLayout, clientRender );
}

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import siteSwitcher from './controller';

export default function () {
	page( '/switch-site', siteSwitcher, makeLayout, clientRender );
}

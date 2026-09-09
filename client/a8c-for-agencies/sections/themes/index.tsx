import page from '@automattic/calypso-router';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { themesContext } from './controller';

import './style.scss';

export default function () {
	page( '/themes', requireAccessContext, themesContext, makeLayout, clientRender );
}

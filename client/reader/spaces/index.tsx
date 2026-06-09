import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { spaces } from './controller';

export default function initSpaces() {
	page( '/reader/spaces', sidebar, setBeforePrimary, spaces, makeLayout, clientRender );
	page( '/reader/spaces/:id', sidebar, setBeforePrimary, spaces, makeLayout, clientRender );
}

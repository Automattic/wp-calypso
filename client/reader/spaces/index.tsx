import './style.scss';

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { spaces } from './controller';

// Default export required: the section loader invokes `module.default`
// (see `client/sections-middleware.js`).
export default function initSpaces() {
	page( '/reader/spaces/:id', sidebar, setBeforePrimary, spaces, makeLayout, clientRender );
	page( '/reader/spaces/:id/:tab', sidebar, setBeforePrimary, spaces, makeLayout, clientRender );
}

import './style.scss';

import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { spaces } from './controller';

// Default export required: the section loader invokes `module.default`
// (see `client/sections-middleware.js`).
export default function initSpaces() {
	readerPage( '/reader/spaces/:slug', sidebar, spaces, makeLayout, clientRender );
	readerPage( '/reader/spaces/:slug/:tab', sidebar, spaces, makeLayout, clientRender );
}

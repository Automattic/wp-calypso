import './style.scss';

import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { readerPage } from 'calypso/reader/lib/reader-router';
import { shelves } from './controller';

// Default export required: the section loader invokes `module.default`
// (see `client/sections-middleware.js`).
export default function initShelves() {
	readerPage( '/reader/shelves/:slug', sidebar, shelves, makeLayout, clientRender );
	readerPage( '/reader/shelves/:slug/:tab', sidebar, shelves, makeLayout, clientRender );
}

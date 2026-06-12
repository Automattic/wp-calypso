import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { saved } from './controller';

export default function () {
	if ( isEnabled( 'reader/saved-posts' ) ) {
		page( '/read/saved', sidebar, setBeforePrimary, saved, makeLayout, clientRender );
	}
}

import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/reader/controller';
import { likes } from './controller';

export default function () {
	page( '/activities/likes', sidebar, likes, makeLayout, clientRender );
}

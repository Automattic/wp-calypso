import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, setBeforePrimary } from 'calypso/reader/controller';
import { likes } from './controller';

export default function () {
	page( '/activities/likes', sidebar, setBeforePrimary, likes, makeLayout, clientRender );
}

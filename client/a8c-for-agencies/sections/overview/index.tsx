import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { overviewContext } from './controller';

export default function () {
	page( '/overview', overviewContext, makeLayout, clientRender );
}

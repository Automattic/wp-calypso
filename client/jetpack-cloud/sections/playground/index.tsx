import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import * as playgroundController from './controller';

export default function (): void {
	page( '/playground', playgroundController.requirePlaygroundContext, makeLayout, clientRender );
}

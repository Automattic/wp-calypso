import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	page( '/signup', controller.signUpContext, makeLayout, clientRender );
	page( '/signup/finish', controller.finishSignUpContext, makeLayout, clientRender );
}

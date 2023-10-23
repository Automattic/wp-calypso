import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { partnerProgramSignupBasePath } from 'calypso/lib/jetpack/paths';
import * as controller from './controller';

export default function () {
	page(
		partnerProgramSignupBasePath(),
		controller.requireNoPartnerRecordContext,
		controller.signUpContext,
		makeLayout,
		clientRender
	);
}

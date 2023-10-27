import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { agencySignupBasePath, agencySignupLegacyPath } from 'calypso/lib/jetpack/paths';
import * as controller from './controller';

export default function () {
	page(
		agencySignupBasePath(),
		controller.requireNoPartnerRecordContext,
		controller.signUpContext,
		makeLayout,
		clientRender
	);

	page( agencySignupLegacyPath(), agencySignupBasePath() );
}

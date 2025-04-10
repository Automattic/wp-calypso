import { translate } from 'i18n-calypso';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequiredComponent from 'calypso/me/reauth-required';
import './style.scss';

export default function ReauthRequired() {
	return (
		<>
			<p>ok2</p>
			<DocumentHead title={ translate( 'Reauth Required' ) } />
			<ReauthRequiredComponent twoStepAuthorization={ twoStepAuthorization } />
		</>
	);
}

import { translate } from 'i18n-calypso';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import './style.scss';

export default function ReauthRequired() {
	return (
		<Main className="reauth-required">
			<DocumentHead title={ translate( 'Reauth Required' ) } />
			<h1>Reauth Required</h1>
		</Main>
	);
}

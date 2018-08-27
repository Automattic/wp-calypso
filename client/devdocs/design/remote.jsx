/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import RemoteBlock from 'components/remote-block';


export default class Remote extends React.PureComponent {
	static displayName = 'Remote';

	render() {
		return (
			<Main className="devdocs design__remote devdocs__remote">
				<DocumentHead title="Remote" />

				<div className="design__remote-content devdocs__doc-content">
					<h1>Remote</h1>
					<p>This demonstrates safely loading a UI component from a third-party domain by using a WebWorker.</p>
					<p>This allows us to sanitize access to in-page resources such as cookies</p>
					<RemoteBlock siteURL={'http://goldsounds.ngrok.io'} componentSlug={'performance'}/>
				</div>
			</Main>
		);
	}
}

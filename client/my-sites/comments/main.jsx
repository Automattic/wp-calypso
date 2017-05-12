/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';

export class CommentsManagement extends Component {

	static propTypes = {
		basePath: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const { translate, basePath } = this.props;
		return (
			<Main className="comments">
				<PageViewTracker path={ basePath } title="Manage Comments" />
				<DocumentHead title={ translate( 'Manage Comments' ) } />
				<div>Hello World!</div>
			</Main>
		);
	}
}

export default localize( CommentsManagement );

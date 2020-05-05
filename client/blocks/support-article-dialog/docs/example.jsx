/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import { localizeUrl } from 'lib/i18n-utils';

const postId = 143180;
const postUrl = localizeUrl(
	'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
);

class SupportArticleDialogExample extends Component {
	handleClick = () => {
		this.props.openSupportArticleDialog( { postId, postUrl } );
	};

	render() {
		return (
			<div className="docs__design-assets-group">
				<Button onClick={ this.handleClick }>Show Support Article</Button>
			</div>
		);
	}
}

const ConnectedExample = connect( null, {
	openSupportArticleDialog,
} )( SupportArticleDialogExample );

ConnectedExample.displayName = 'SupportArticleDialog';

export default ConnectedExample;

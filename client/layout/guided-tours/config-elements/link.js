/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import InlineSupportLink from 'components/inline-support-link';

class Link extends Component {
	static displayName = 'Link';

	constructor( props ) {
		super( props );
	}

	render() {
		/* eslint-disable react/jsx-no-target-blank */
		return (
			<div className="config-elements__link guided-tours__external-link">
				{ ! this.props.supportArticleId && (
					<ExternalLink target="_blank" icon={ true } href={ this.props.href }>
						{ this.props.children }
					</ExternalLink>
				) }
				{ this.props.supportArticleId && (
					<InlineSupportLink
						supportPostId={ this.props.supportArticleId }
						supportLink={ this.props.href }
					>
						{ this.props.children }
					</InlineSupportLink>
				) }
			</div>
		);
		/* eslint-enable react/jsx-no-target-blank */
	}
}

export default Link;

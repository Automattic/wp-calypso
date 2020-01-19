/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

class Link extends Component {
	static displayName = 'Link';

	constructor( props ) {
		super( props );
	}

	render() {
		/* eslint-disable react/jsx-no-target-blank */
		return (
			<div className="guided-tours__external-link">
				<ExternalLink target="_blank" icon={ true } href={ this.props.href }>
					{ this.props.children }
				</ExternalLink>
			</div>
		);
		/* eslint-enable react/jsx-no-target-blank */
	}
}

export default Link;

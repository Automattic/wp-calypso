/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';

export default class extends React.PureComponent {
	static displayName = 'InlineSupportLink';

	render() {
		const inlineSupportProps = {
			supportPostId: 38147,
			supportLink: 'https://wordpress.com/support/audio/podcasting/',
		};
		return <InlineSupportLink { ...inlineSupportProps } />;
	}
}

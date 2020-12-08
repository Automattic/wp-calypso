/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SupportInfo from 'calypso/components/support-info';

export default class extends React.PureComponent {
	static displayName = 'SupportInfo';

	render() {
		const support = {
			text: 'Example support info. Lorem Ipsum is simply dummy text.',
			link: 'https://www.lipsum.com/',
			privacyLink: 'https://www.lipsum.com/#privacy',
		};
		return <SupportInfo { ...support } />;
	}
}

import { PureComponent } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';

export default class extends PureComponent {
	static displayName = 'InlineSupportLink';

	render() {
		const inlineSupportProps = {
			supportPostId: 38147,
			// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
			supportLink: 'https://wordpress.com/support/audio/podcasting/',
		};
		return <InlineSupportLink { ...inlineSupportProps }>Link Text</InlineSupportLink>;
	}
}

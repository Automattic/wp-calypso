/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CUSTOM_DNS } from 'lib/url/support';

class DnsDetails extends React.PureComponent {
	render() {
		const { translate } = this.props;

		return (
			<p className="dns__details">
				{ translate(
					'DNS records are special settings that change how your domain works. ' +
						'They let you connect to third-party services, like an email provider. '
				) }
				<a href={ CUSTOM_DNS }>{ translate( 'Learn more.' ) }</a>
			</p>
		);
	}
}

export default localize( DnsDetails );

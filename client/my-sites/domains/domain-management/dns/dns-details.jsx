import { localizeUrl } from '@automattic/i18n-utils';
import { CUSTOM_DNS } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';

class DnsDetails extends PureComponent {
	render() {
		const { translate } = this.props;

		return (
			<p className="dns__details">
				{ translate(
					'DNS records are special settings that change how your domain works. ' +
						'They let you connect to third-party services, like an email provider. ' +
						'{{customDnsLink}}Learn more{{/customDnsLink}}.',
					{
						components: {
							customDnsLink: (
								<a href={ localizeUrl( CUSTOM_DNS ) } target="_blank" rel="noopener noreferrer" />
							),
						},
					}
				) }
			</p>
		);
	}
}

export default localize( DnsDetails );

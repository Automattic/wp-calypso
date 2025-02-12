import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';

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
								<InlineSupportLink supportContext="manage-your-dns-records" showIcon={ false } />
							),
						},
					}
				) }
			</p>
		);
	}
}

export default localize( DnsDetails );

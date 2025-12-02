import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';

export default function DnsDescription() {
	return createInterpolateElement(
		__( 'DNS records change how your domain works. <learnMoreLink />' ),
		{
			learnMoreLink: <InlineSupportLink supportContext="manage-your-dns-records" />,
		}
	);
}

import { useTranslate } from 'i18n-calypso';
import ExpandedCard from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/expanded-card';

const HostingSummary = () => {
	const translate = useTranslate();
	return (
		<ExpandedCard header={ translate( 'Hosting' ) }>
			<hr />
			<ul>
				<li>Status</li>
				<li>Host</li>
				<li>PHP version</li>
				<li>WP version</li>
			</ul>
		</ExpandedCard>
	);
};

export default HostingSummary;

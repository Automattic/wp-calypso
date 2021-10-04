import { localize } from 'i18n-calypso';
import moment from 'moment';
import whoopsImage from 'calypso/assets/images/illustrations/whoops.svg';
import EmptyContent from 'calypso/components/empty-content';
import { getTld } from 'calypso/lib/domains';

const MaintenanceCard = ( { selectedDomainName, translate, tldMaintenanceEndTime } ) => {
	const tld = getTld( selectedDomainName );

	let maintenanceEnd = translate( 'shortly', {
		comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
	} );

	if ( tldMaintenanceEndTime ) {
		maintenanceEnd = moment.unix( tldMaintenanceEndTime ).fromNow();
	}

	const message = translate(
		'No changes are allowed during that time. Please check back %(maintenanceEnd)s.',
		{
			args: { maintenanceEnd },
		}
	);

	return (
		<EmptyContent
			title={ translate( '{{strong}}.%(tld)s{{/strong}} is undergoing maintenance', {
				components: { strong: <strong /> },
				args: { tld },
			} ) }
			line={ message }
			illustration={ whoopsImage }
		/>
	);
};

export default localize( MaintenanceCard );

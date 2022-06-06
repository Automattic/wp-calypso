import { localize, LocalizeProps } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PlanStorage from 'calypso/blocks/plan-storage';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ExcessiveDiskSpace = ( { translate }: { translate: LocalizeProps[ 'translate' ] } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	return (
		<div>
			{ translate( "Your site's disk usage exceeds the amount provided by its plan." ) }
			<div className="eligibility-warnings__plan-storage-wrapper">
				<PlanStorage siteId={ selectedSiteId }>{ null }</PlanStorage>
			</div>
			{ translate(
				'Please purchase a plan with additional storage or contact our support team for help.'
			) }
		</div>
	);
};
export default localize( ExcessiveDiskSpace );

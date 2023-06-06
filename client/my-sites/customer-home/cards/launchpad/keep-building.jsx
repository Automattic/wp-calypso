import { CircularProgressBar } from '@automattic/components';
import { Launchpad } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const LaunchpadKeepBuilding = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<div className="launchpad-keep-building">
			<div className="launchpad-keep-building__header">
				<h2 className="launchpad-keep-building__title">
					{ translate( 'Next steps for your site' ) }
				</h2>
				<div className="launchpad-keep-building__progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						currentStep={ 2 }
						numberOfSteps={ 5 }
					/>
				</div>
			</div>
			<Launchpad siteSlug={ siteSlug } />
		</div>
	);
};

const ConnectedLaunchpadKeepBuilding = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( LaunchpadKeepBuilding );

export default ConnectedLaunchpadKeepBuilding;

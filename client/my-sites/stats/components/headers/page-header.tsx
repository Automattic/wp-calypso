import config from '@automattic/calypso-config';
import NavigationHeaderImpr from 'calypso/components/navigation-header/navigation-header';
import { STATS_PRODUCT_NAME, STATS_PRODUCT_NAME_IMPR } from '../../constants';
import { JetpackLogo } from '@automattic/components';

function PageHeader() {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	if ( isOdysseyStats ) {
		return (
			<NavigationHeaderImpr
				className="stats__section-header modernized-header"
				title={ STATS_PRODUCT_NAME }
				titleLogo={ <JetpackLogo size={ 24 } monochrome={ false } /> }
			/>
		);
	}

	return (
		<NavigationHeaderImpr
			className="stats__section-header modernized-header"
			title={ STATS_PRODUCT_NAME_IMPR }
		/>
	);
}

export default PageHeader;

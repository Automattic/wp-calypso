import config from '@automattic/calypso-config';
import JetpackLogo from 'calypso/components/jetpack-logo';
import NavigationHeaderImpr, {
	HeaderProps,
} from 'calypso/components/navigation-header/navigation-header';
import { STATS_PRODUCT_NAME, STATS_PRODUCT_NAME_IMPR } from '../../constants';

function PageHeader( props: HeaderProps ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	if ( isOdysseyStats ) {
		return (
			<NavigationHeaderImpr
				className="stats__section-header modernized-header"
				titleProps={ {
					title: STATS_PRODUCT_NAME,
					titleLogo: <JetpackLogo size={ 24 } monochrome={ false } />,
				} }
				{ ...props }
			/>
		);
	}

	return (
		<NavigationHeaderImpr
			className="stats__section-header modernized-header"
			titleProps={ {
				title: STATS_PRODUCT_NAME_IMPR,
			} }
			{ ...props }
		/>
	);
}

export default PageHeader;

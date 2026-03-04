import { translate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import NavigationHeaderImpr, {
	HeaderProps,
} from 'calypso/components/navigation-header/navigation-header';
import { STATS_PRODUCT_NAME } from '../../constants';

function PageHeader( { titleProps, ...otherProps }: HeaderProps ) {
	const statsTagline = translate( 'Simple, powerful analytics to grow your site.' ) as string;

	return (
		<NavigationHeaderImpr
			className="stats__section-header modernized-header"
			titleProps={ {
				title: STATS_PRODUCT_NAME,
				titleLogo: <JetpackLogo size={ 24 } monochrome={ false } />,
				subtitle: statsTagline,
				...titleProps,
			} }
			{ ...otherProps }
		/>
	);
}

export default PageHeader;

import { translate } from 'i18n-calypso';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import './style.scss';

const ThemesHeaderFixed = () => {
	return (
		<FixedNavigationHeader className="themes__header-fixed">
			<ScreenOptionsTab wpAdminPath="themes.php" />
			<FormattedHeader
				brandFont
				className="themes__page-heading"
				headerText={ translate( 'Themes' ) }
				align="left"
				hasScreenOptions
			/>
		</FixedNavigationHeader>
	);
};

export default ThemesHeaderFixed;

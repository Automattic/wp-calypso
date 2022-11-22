import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeDetailsUrl,
} from 'calypso/state/themes/selectors';
import InstallThemeButton from './install-theme-button';

import './themes-header.scss';

interface ThemesHeaderProps {
	siteId?: number;
	isReskinned?: boolean;
}

const ThemesHeader: React.FC< ThemesHeaderProps > = ( { siteId, isReskinned } ) => {
	const currentThemeId = useSelector( ( state ) => getActiveTheme( state, siteId ) );
	const currentTheme = useSelector( ( state ) =>
		getCanonicalTheme( state, siteId, currentThemeId )
	);
	const currentThemeDetailsUrl = useSelector( ( state ) =>
		getThemeDetailsUrl( state, currentThemeId, siteId )
	);

	return (
		<div className="themes__header">
			{ siteId && <QueryActiveTheme siteId={ siteId } /> }
			{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }
			<ScreenOptionsTab wpAdminPath="themes.php" />
			{ isReskinned ? (
				<div className="themes__page-heading">
					<h1>{ translate( 'Themes' ) }</h1>
				</div>
			) : (
				<FormattedHeader
					brandFont
					className="themes__page-heading"
					headerText={ translate( 'Themes' ) }
					subHeaderText={ translate(
						'Select or update the visual design for your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="themes" showIcon={ false } />,
							},
						}
					) }
					align="left"
					hasScreenOptions
				/>
			) }
			<div className="themes__page-actions">
				<div className="themes__page-current-theme">
					{ currentTheme && (
						<>
							<span>{ translate( 'Current theme' ) }: </span>
							<a href={ currentThemeDetailsUrl }>{ currentTheme.name }</a>
						</>
					) }
				</div>
				<div className="themes__install-theme-button-container">
					<InstallThemeButton />
				</div>
			</div>
		</div>
	);
};

export default ThemesHeader;

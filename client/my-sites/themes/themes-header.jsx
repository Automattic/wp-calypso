import { translate } from 'i18n-calypso';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import InstallThemeButton from './install-theme-button';

import './themes-header.scss';

const ThemesHeader = () => {
	return (
		<div className="themes__header">
			<ScreenOptionsTab wpAdminPath="themes.php" />
			<FormattedHeader
				brandFont
				className="themes__page-heading"
				headerText={ translate( 'Themes' ) }
				subHeaderText={ translate( 'Select or update the visual design for your site.' ) }
				align="left"
				hasScreenOptions
			/>
			<div className="themes__install-theme-button-container">
				<InstallThemeButton />
			</div>
		</div>
	);
};

export default ThemesHeader;

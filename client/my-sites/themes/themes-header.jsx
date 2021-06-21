/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */

import FormattedHeader from 'calypso/components/formatted-header';
import { translate } from 'i18n-calypso';
import InstallThemeButton from './install-theme-button';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import config from '@automattic/calypso-config';

/**
 * Style dependencies
 */
import './themes-header.scss';

const ThemesHeader = () => {
	return (
		<div className="themes__header">
			<ScreenOptionsTab />
			<FormattedHeader
				brandFont
				className="themes__page-heading"
				headerText={ translate( 'Themes' ) }
				subHeaderText={ translate( 'Select or update the visual design for your site.' ) }
				align="left"
				hasScreenOptions={ config.isEnabled( 'nav-unification/switcher' ) }
			/>
			<div className="themes__install-theme-button-container">
				<InstallThemeButton />
			</div>
		</div>
	);
};

export default ThemesHeader;

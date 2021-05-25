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

/**
 * Style dependencies
 */
import './themes-header.scss';

const ThemesHeader = () => {
	return (
		<div className="themes__header">
			<FormattedHeader
				brandFont
				className="themes__page-heading"
				headerText={ translate( 'Themes' ) }
				subHeaderText={ translate( 'Select or update the visual design for your site.' ) }
				align="left"
			/>
			<div className="themes__install-theme-button-container">
				<InstallThemeButton />
			</div>
		</div>
	);
};

export default ThemesHeader;

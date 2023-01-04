import { translate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import InstallThemeButton from './install-theme-button';

import './themes-header.scss';

const ThemesHeader = () => {
	return (
		<div className="themes__header">
			<ScreenOptionsTab wpAdminPath="themes.php" />
			<div className="themes__page-heading">
				<h1>{ translate( 'Themes' ) }</h1>
				<p className="page-sub-header">
					{ translate(
						'Select or update the visual design for your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="themes" showIcon={ false } />,
							},
						}
					) }
				</p>
			</div>
			<div className="themes__install-theme-button-container">
				<InstallThemeButton />
			</div>
		</div>
	);
};

export default ThemesHeader;

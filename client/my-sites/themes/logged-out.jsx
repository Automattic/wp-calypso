import Main from 'calypso/components/main';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default ( props ) => (
	<Main fullWidthLayout isLoggedOut className="themes">
		<ConnectedThemeShowcase
			{ ...props }
			origin="wpcom"
			defaultOption="signup"
			getScreenshotOption={ function () {
				return 'info';
			} }
			source="showcase"
			showUploadButton={ false }
			loggedOutComponent
		/>
	</Main>
);

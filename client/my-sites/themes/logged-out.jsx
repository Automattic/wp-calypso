import { isEnabled } from '@automattic/calypso-config';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default ( props ) => (
	<Main fullWidthLayout className="themes">
		{ isEnabled( 'themes/showcase-i4/search-and-filter' ) && (
			<BodySectionCssClass bodyClass={ [ 'is-section-themes-i4' ] } />
		) }
		{ isEnabled( 'themes/showcase-i4/details-and-preview' ) && (
			<BodySectionCssClass bodyClass={ [ 'is-section-themes-i4-2' ] } />
		) }
		<ConnectedThemeShowcase
			{ ...props }
			origin="wpcom"
			defaultOption="signup"
			getScreenshotOption={ function () {
				return 'info';
			} }
			source="showcase"
			showUploadButton={ false }
			loggedOutComponent={ true }
		/>
	</Main>
);

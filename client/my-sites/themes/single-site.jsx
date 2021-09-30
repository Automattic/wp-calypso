import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getActiveTheme } from 'calypso/state/themes/selectors/get-active-theme';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SingleSiteThemeShowcaseJetpack from './single-site-jetpack';
import SingleSiteThemeShowcaseWpcom from './single-site-wpcom';

const SingleSiteThemeShowcaseWithOptions = ( props ) => {
	const { activeTheme, isJetpack, siteId, translate } = props;

	const getScreenshotOption = ( themeId ) => {
		return activeTheme === themeId ? 'customize' : 'info';
	};

	// If we've only just switched from single to multi-site, there's a chance
	// this component is still being rendered with site unset, so we need to guard
	// against that case.
	if ( ! siteId ) {
		return <Main fullWidthLayout className="themes" />;
	}

	if ( isJetpack ) {
		return (
			<SingleSiteThemeShowcaseJetpack
				{ ...props }
				siteId={ siteId }
				defaultOption="activate"
				secondaryOption="tryandcustomize"
				source="showcase"
				getScreenshotOption={ getScreenshotOption }
				listLabel={ translate( 'Uploaded themes' ) }
				placeholderCount={ 5 }
			/>
		);
	}

	return (
		<SingleSiteThemeShowcaseWpcom
			{ ...props }
			origin="wpcom"
			siteId={ siteId }
			defaultOption="activate"
			secondaryOption="tryandcustomize"
			source="showcase"
			getScreenshotOption={ getScreenshotOption }
		/>
	);
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		siteId: selectedSiteId,
		isJetpack: isJetpackSite( state, selectedSiteId ),
		activeTheme: getActiveTheme( state, selectedSiteId ),
	};
} )( localize( SingleSiteThemeShowcaseWithOptions ) );

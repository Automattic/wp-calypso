/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SingleSiteThemeShowcaseWpcom from './single-site-wpcom';
import SingleSiteThemeShowcaseJetpack from './single-site-jetpack';
import sitesFactory from 'lib/sites-list';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isThemeActive } from 'state/themes/selectors';
import { canCurrentUser } from 'state/selectors';

const SingleSiteThemeShowcaseWithOptions = ( props ) => {
	const { isJetpack, translate } = props;
	const sites = sitesFactory();
	const site = sites.getSelectedSite();

	// If we've only just switched from single to multi-site, there's a chance
	// this component is still being rendered with site unset, so we need to guard
	// against that case.
	if ( ! site ) {
		return <Main className="themes" />;
	}

	if ( isJetpack ) {
		return (
			<SingleSiteThemeShowcaseJetpack { ...props }
				site={ site }
				siteId={ site.ID }
				options={ [
					'customize',
					'preview',
					'purchase',
					'activate',
					'tryandcustomize',
					'deleteTheme',
					'separator',
					'info',
					'support',
					'help'
				] }
				defaultOption="activate"
				secondaryOption="tryandcustomize"
				source="showcase"
				listLabel={ translate( 'Uploaded themes' ) }
			/>
		);
	}

	return (
		<SingleSiteThemeShowcaseWpcom { ...props }
			site={ site }
			siteId={ site.ID }
			options={ [
				'customize',
				'preview',
				'purchase',
				'activate',
				'tryandcustomize',
				'separator',
				'info',
				'support',
				'help'
			] }
			defaultOption="activate"
			secondaryOption="tryandcustomize"
			source="showcase"
		/>
	);
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			isJetpack: isJetpackSite( state, selectedSiteId ),
			isCustomizable: canCurrentUser( state, selectedSiteId, 'edit_theme_options' ),
			getScreenshotOption: ( theme ) => isThemeActive( state, theme.id, selectedSiteId ) ? 'customize' : 'info'
		};
	}
)( localize( SingleSiteThemeShowcaseWithOptions ) );

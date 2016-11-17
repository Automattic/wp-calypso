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
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isActiveTheme } from 'state/themes/current-theme/selectors';
import { canCurrentUser } from 'state/current-user/selectors';

const SingleSiteThemeShowcaseWithOptions = ( props ) => {
	const { isJetpack } = props;
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
			source="showcase" />
	);
};

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		return {
			selectedSite,
			isJetpack: selectedSite && isJetpackSite( state, selectedSite.ID ),
			isCustomizable: selectedSite && canCurrentUser( state, selectedSite.ID, 'edit_theme_options' ),
			getScreenshotOption: ( theme ) => ( selectedSite && isActiveTheme( state, theme.id, selectedSite.ID ) ) ? 'customize' : 'info'
		};
	}
)( localize( SingleSiteThemeShowcaseWithOptions ) );

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import WebPreview from 'calypso/components/web-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { hideThemePreview } from 'calypso/state/themes/actions';
import {
	getThemeDemoUrl,
	getThemePreviewThemeOptions,
	themePreviewVisibility,
	isActivatingTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { connectOptions } from './theme-options';

class ThemePreview extends Component {
	static displayName = 'ThemePreview';

	static propTypes = {
		// connected props
		belowToolbar: PropTypes.element,
		demoUrl: PropTypes.string,
		isActivating: PropTypes.bool,
		isJetpack: PropTypes.bool,
		themeId: PropTypes.string,
		themeOptions: PropTypes.object,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isActivating && ! nextProps.isActivating ) {
			this.props.hideThemePreview();
		}
	}

	componentWillUnmount() {
		this.props.hideThemePreview();
	}

	getStyleVariationOption = () => {
		return this.props.themeOptions?.styleVariation;
	};

	appendStyleVariationOptionToUrl = ( url, key = 'slug' ) => {
		const styleVariationOption = this.getStyleVariationOption();
		if ( ! styleVariationOption ) {
			return url;
		}

		const [ base, query ] = url.split( '?' );
		const params = new URLSearchParams( query );
		params.set( 'style_variation', styleVariationOption[ key ] );

		return `${ base }?${ params.toString() }`;
	};

	render() {
		const { themeId, siteId, demoUrl, children, isWPForTeamsSite, themeOptions } = this.props;

		if ( ! themeId || isWPForTeamsSite ) {
			return null;
		}

		return (
			<div>
				<QueryCanonicalTheme siteId={ siteId } themeId={ themeId } />
				{ children }
				{ demoUrl && (
					<WebPreview
						themeId={ themeId }
						showPreview
						showExternal={ false }
						showEditHeaderLink
						showSEO={ false }
						onClose={ this.props.hideThemePreview }
						previewUrl={ this.appendStyleVariationOptionToUrl(
							demoUrl + '?demo=true&iframe=true&theme_preview=true',
							'title'
						) }
						externalUrl={ demoUrl }
						belowToolbar={ this.props.belowToolbar }
						themeOptions={ themeOptions }
					/>
				) }
			</div>
		);
	}
}

// make all actions available to preview.
const ConnectedThemePreview = connectOptions( ThemePreview );

export default connect(
	( state ) => {
		const themeId = themePreviewVisibility( state );
		if ( ! themeId ) {
			return { themeId };
		}

		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const themeOptions = getThemePreviewThemeOptions( state );
		return {
			themeId,
			siteId,
			siteSlug,
			isJetpack,
			themeOptions,
			isActivating: isActivatingTheme( state, siteId ),
			demoUrl: getThemeDemoUrl( state, themeId, siteId ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			options: [
				'activate',
				'preview',
				'purchase',
				'upgradePlan',
				'tryandcustomize',
				'customize',
				'separator',
				'info',
				'signup',
				'support',
				'help',
			],
		};
	},
	{ hideThemePreview, recordTracksEvent }
)( localize( ConnectedThemePreview ) );

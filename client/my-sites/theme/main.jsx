/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import QueryTheme from 'components/data/query-theme';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import ThemeSheetContent from './theme-sheet-content';
import Button from 'components/button';
import { getSelectedSite } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isUserPaid } from 'state/purchases/selectors';
import ThanksModal from 'my-sites/themes/thanks-modal';
import QueryActiveTheme from 'components/data/query-active-theme';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryUserPurchases from 'components/data/query-user-purchases';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemesSiteSelectorModal from 'my-sites/themes/themes-site-selector-modal';
import { connectOptions } from 'my-sites/themes/theme-options';
import {
	isThemeActive,
	isThemePremium,
	isThemePurchased,
	getThemeRequestErrors,
	getThemeForumUrl,
	isWpcomTheme as isThemeWpcom,
} from 'state/themes/selectors';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import EmptyContentComponent from 'components/empty-content';
import ThemePreview from 'my-sites/themes/theme-preview';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { decodeEntities } from 'lib/formatting';
import { getTheme } from 'state/themes/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';

const ThemeSheet = React.createClass( {
	displayName: 'ThemeSheet',

	propTypes: {
		id: React.PropTypes.string,
		// Connected props
		theme: React.PropTypes.object,
		isLoggedIn: React.PropTypes.bool,
		isActive: React.PropTypes.bool,
		isPurchased: React.PropTypes.bool,
		isJetpack: React.PropTypes.bool,
		isPremium: React.PropTypes.bool,
		selectedSite: React.PropTypes.object,
		siteSlug: React.PropTypes.string,
		backPath: React.PropTypes.string,
		isWpcomTheme: React.PropTypes.bool,
		defaultOption: React.PropTypes.shape( {
			label: React.PropTypes.string,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func,
		} ),
		secondaryOption: React.PropTypes.shape( {
			label: React.PropTypes.string,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func,
		} ),
	},

	getDefaultProps() {
		// The defaultOption default prop is surprisingly important, see the long
		// comment near the connect() function at the bottom of this file.
		return {
			section: '',
			defaultOption: {},
		};
	},

	getInitialState() {
		return {
			showPreview: false,
		};
	},

	componentDidMount() {
		window.scroll( 0, 0 );
	},

	isLoaded() {
		// We need to make sure the theme object has been loaded including full details
		// (and not just without, as would've been stored by the `<QueryThemes />` (plural!)
		// component used by the theme showcase's list view). However, these extra details
		// aren't present for a Jetpack site.
		if ( this.props.isJetpack ) {
			return !! this.props.theme.name;
		}
		return !! this.props.theme.screenshots;
	},

	onButtonClick() {
		const { defaultOption } = this.props;
		defaultOption.action && defaultOption.action( this.props );
	},

	onSecondaryButtonClick() {
		const { secondaryOption } = this.props;
		secondaryOption && secondaryOption.action && secondaryOption.action( this.props );
	},

	togglePreview() {
		this.setState( { showPreview: ! this.state.showPreview } );
	},

	renderBar() {
		const { theme } = this.props;

		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = this.props.theme.name || placeholder;
		const tag = theme.author ? i18n.translate( 'by %(author)s', { args: { author: theme.author } } ) : placeholder;

		return (
			<div className="theme__sheet-bar">
				<span className="theme__sheet-bar-title">{ title }</span>
				<span className="theme__sheet-bar-tag">{ tag }</span>
			</div>
		);
	},

	getDefaultOptionLabel() {
		const { defaultOption, isActive, isLoggedIn, isPremium, isPurchased } = this.props;
		if ( isLoggedIn && ! isActive ) {
			if ( isPremium && ! isPurchased ) { // purchase
				return i18n.translate( 'Pick this design' );
			} // else: activate
			return i18n.translate( 'Activate this design' );
		}
		return defaultOption.label;
	},

	renderPreview() {
		const { isActive, isLoggedIn, defaultOption, secondaryOption } = this.props;

		const showSecondaryButton = secondaryOption && ! isActive && isLoggedIn;
		return (
			<ThemePreview showPreview={ this.state.showPreview }
				theme={ this.props.theme }
				onClose={ this.togglePreview }
				primaryButtonLabel={ this.getDefaultOptionLabel() }
				getPrimaryButtonHref={ defaultOption.getUrl }
				onPrimaryButtonClick={ this.onButtonClick }
				secondaryButtonLabel={ showSecondaryButton ? secondaryOption.label : null }
				onSecondaryButtonClick={ this.onSecondaryButtonClick }
				getSecondaryButtonHref={ showSecondaryButton ? secondaryOption.getUrl : null }
			/>
		);
	},

	renderError() {
		const emptyContentTitle = i18n.translate( 'Looking for great WordPress designs?', {
			comment: 'Message displayed when requested theme was not found',
		} );
		const emptyContentMessage = i18n.translate( 'Check our theme showcase', {
			comment: 'Message displayed when requested theme was not found',
		} );

		return (
			<Main>
				<EmptyContentComponent
					title={ emptyContentTitle }
					line={ emptyContentMessage }
					action={ i18n.translate( 'View the showcase' ) }
					actionURL="/design"
				/>
			</Main>
		);
	},

	renderPrice() {
		let price = this.props.theme.price;
		if ( ! this.isLoaded() || this.props.isActive || this.props.isPurchased ) {
			price = '';
		} else if ( ! this.props.isPremium ) {
			price = i18n.translate( 'Free' );
		}

		return price ? <span className="theme__sheet-action-bar-cost">{ price }</span> : '';
	},

	renderButton() {
		const { getUrl } = this.props.defaultOption;
		const label = this.getDefaultOptionLabel();
		const placeholder = <span className="theme__sheet-button-placeholder">loading......</span>;

		return (
			<Button className="theme__sheet-primary-button"
				href={ getUrl ? getUrl( this.props.theme ) : null }
				onClick={ this.onButtonClick }>
				{ this.isLoaded() ? label : placeholder }
				{ this.renderPrice() }
			</Button>
		);
	},

	renderSheet() {
		const { section } = this.props;
		const siteID = this.props.selectedSite && this.props.selectedSite.ID;

		const analyticsPath = `/theme/:slug${ section ? '/' + section : '' }${ siteID ? '/:site_id' : '' }`;
		const analyticsPageTitle = `Themes > Details Sheet${ section ? ' > ' + titlecase( section ) : '' }${ siteID ? ' > Site' : '' }`;

		const { currentUserId, isJetpack, isPremium, siteIdOrWpcom, theme } = this.props;
		const title = theme.name && i18n.translate( '%(themeName)s Theme', {
			args: { themeName: theme.name }
		} );
		const canonicalUrl = `https://wordpress.com/theme/${ this.props.id }`; // TODO: use getDetailsUrl() When it becomes availavle

		const metas = [
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:image', content: theme.screenshot },
			{ property: 'og:type', content: 'website' }
		];

		if ( theme.description ) {
			metas.push( {
				name: 'description',
				property: 'og:description',
				content: decodeEntities( theme.description )
			} );
		}

		const links = [ { rel: 'canonical', href: canonicalUrl } ];

		return (
			<Main className="theme__sheet">
				<QueryTheme themeId={ this.props.id } siteId={ siteIdOrWpcom } />
				{ isJetpack && <QueryTheme themeId={ this.props.id } siteId="wporg" /> }
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				{ siteID && <QuerySitePurchases siteId={ siteID } /> }
				{ siteID && <QuerySitePlans siteId={ siteID } /> }
				<DocumentHead
					title={ title }
					meta={ metas }
					link={ links } />
				<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
				{ this.renderBar() }
				{ siteID && <QueryActiveTheme siteId={ siteID } /> }
				<ThanksModal
					site={ this.props.selectedSite }
					source={ 'details' } />
				{ this.state.showPreview && this.renderPreview() }
				<HeaderCake className="theme__sheet-action-bar"
					backHref={ this.props.backPath }
					backText={ i18n.translate( 'All Themes' ) }>
					{ this.renderButton() }
				</HeaderCake>
				<ThemeSheetContent
					section={ section }
					isJetpack={ isJetpack }
					isPremium={ isPremium }
					demo_uri={ theme.demo_uri }
					togglePreview={ this.togglePreview }
					siteSlug={ this.props.siteSlug }
					id={ this.props.id }
					isLoaded={ this.isLoaded() }
					isCurrentUserPaid={ this.props.isCurrentUserPaid }
					theme={ theme } />
			</Main>
		);
	},

	render() {
		if ( this.props.error ) {
			return this.renderError();
		}
		return this.renderSheet();
	},
} );

const ConnectedThemeSheet = connectOptions(
	( props ) => {
		if ( ! props.isLoggedIn || props.selectedSite ) {
			return <ThemeSheet { ...props } />;
		}

		return (
			<ThemesSiteSelectorModal { ...props }
				sourcePath={ `/theme/${ props.id }${ props.section ? '/' + props.section : '' }` }>
				<ThemeSheet />
			</ThemesSiteSelectorModal>
		);
	}
);

const ThemeSheetWithOptions = ( props ) => {
	const {
		selectedSite: site,
		isActive,
		isLoggedIn,
		isPremium,
		isPurchased,
		isJetpack,
		isWpcomTheme,
	} = props;
	const siteId = site ? site.ID : null;

	let defaultOption;

	if ( ! isLoggedIn ) {
		defaultOption = 'signup';
	} else if ( isActive ) {
		defaultOption = 'customize';
	} else if ( isJetpack && isWpcomTheme ) {
		defaultOption = 'activateOnJetpack';
	} else if ( isPremium && ! isPurchased ) {
		defaultOption = 'purchase';
	} else {
		defaultOption = 'activate';
	}

	return (
		<ConnectedThemeSheet { ...props }
			siteId={ siteId }
			theme={ props.theme /* TODO: Have connectOptions() only use theme ID */ }
			options={ [
				'signup',
				'customize',
				'tryandcustomize',
				'purchase',
				'activate',
				'activateOnJetpack',
				'tryAndCustomizeOnJetpack',
			] }
			defaultOption={ defaultOption }
			secondaryOption={ ( isJetpack && isWpcomTheme ) ? 'tryAndCustomizeOnJetpack' : 'tryandcustomize' }
			source="showcase-sheet" />
	);
};

export default connect(
	/*
	 * A number of the props that this mapStateToProps function computes are used
	 * by ThemeSheetWithOptions to compute defaultOption. After a state change
	 * triggered by an async action, connect()ed child components are, quite
	 * counter-intuitively, updated before their connect()ed parents (this is
	 * https://github.com/reactjs/redux/issues/1415), and might be fixed by
	 * react-redux 5.0.
	 * For this reason, after e.g. activating a theme in single-site mode,
	 * first the ThemeSheetWithOptions component's (child) connectOptions component
	 * will update in response to the currently displayed theme being activated.
	 * Doing so, it will filter and remove the activate option (adding customize
	 * instead). However, since the parent connect()ed-ThemeSheetWithOptions will
	 * only react to the state change afterwards, there is a brief moment when
	 * connectOptions still receives "activate" as its defaultOption prop, when
	 * activate is no longer part of its filtered options set, hence passing on
	 * undefined as the defaultOption object prop for its child. For the theme
	 * sheet, which eventually gets that defaultOption object prop, this means
	 * we must be careful to not accidentally access any attribute of that
	 * defaultOption prop. Otherwise, there will be an error that will prevent the
	 * state update from finishing properly, hence not updating defaultOption at all.
	 * The solution to this incredibly intricate issue is simple: Give ThemeSheet
	 * a valid defaultProp for defaultOption.
	 */
	( state, { id } ) => {
		const selectedSite = getSelectedSite( state );
		const siteSlug = selectedSite ? getSiteSlug( state, selectedSite.ID ) : '';
		const isJetpack = selectedSite && isJetpackSite( state, selectedSite.ID );
		const isWpcomTheme = isThemeWpcom( state, id );
		const siteIdOrWpcom = ( isJetpack && ! isWpcomTheme ) ? selectedSite.ID : 'wpcom';
		const backPath = getBackPath( state );
		const currentUserId = getCurrentUserId( state );
		const isCurrentUserPaid = isUserPaid( state, currentUserId );
		const theme = getTheme( state, siteIdOrWpcom, id );
		const error = theme ? false : getThemeRequestErrors( state, id, siteIdOrWpcom );

		return {
			theme,
			id,
			error,
			selectedSite,
			siteSlug,
			isJetpack,
			siteIdOrWpcom,
			backPath,
			currentUserId,
			isCurrentUserPaid,
			isWpcomTheme,
			isLoggedIn: !! currentUserId,
			isActive: selectedSite && isThemeActive( state, id, selectedSite.ID ),
			isPremium: isThemePremium( state, id ),
			isPurchased: selectedSite && (
				isThemePurchased( state, id, selectedSite.ID ) ||
				hasFeature( state, selectedSite.ID, FEATURE_UNLIMITED_PREMIUM_THEMES )
			),
			forumUrl: selectedSite && getThemeForumUrl( state, id, selectedSite.ID ),
		};
	}
)( ThemeSheetWithOptions );

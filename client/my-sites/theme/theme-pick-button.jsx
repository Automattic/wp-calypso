/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { signup, purchase, activate, customize } from 'state/themes/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { getCurrentTheme } from 'state/themes/current-theme/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { isPremium } from 'my-sites/themes/helpers';
import ThemesSiteSelectorModal from 'my-sites/themes/themes-site-selector-modal';
import actionLabels from 'my-sites/themes/action-labels';

const ThemePickButton = React.createClass( {
	displayName: 'ThemePickButton',

	propTypes: {
		theme: React.PropTypes.object.isRequired,
		className: React.PropTypes.string,
		// activate/purchase/customize action will happen automatically so onClick
		// is just for extra behavior.
		onClick: React.PropTypes.func,
		// The following are provided by connect
		currentTheme: React.PropTypes.object,
		selectedSite: React.PropTypes.object,
		customize: React.PropTypes.func.isRequired,
		activate: React.PropTypes.func.isRequired,
		purchase: React.PropTypes.func.isRequired,
		signup: React.PropTypes.func.isRequired,
		isLoggedIn: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			onClick: noop,
		};
	},

	getInitialState() {
		return { selectedAction: null };
	},

	hideSiteSelectorModal() {
		this.setState( { selectedAction: null } );
	},

	isThemeActive() {
		return this.props.currentTheme && this.props.currentTheme.id === this.props.theme.id && this.props.selectedSite;
	},

	selectSiteAndDispatch( action ) {
		if ( this.props.selectedSite ) {
			this.props[ action ]( this.props.theme, this.props.selectedSite, 'showcase-sheet' );
			this.props.onClick( this.props.theme );
		} else {
			this.setState( { selectedAction: action } );
		}
	},

	onPickTheme() {
		if ( ! this.props.isLoggedIn ) {
			this.props.signup( this.props.theme );
			this.props.onClick( this.props.theme );
		} else if ( isPremium( this.props.theme ) && ! this.props.theme.purchased ) {
			this.selectSiteAndDispatch( 'purchase' );
		} else {
			this.selectSiteAndDispatch( 'activate' );
		}
	},

	onCustomize() {
		this.props.customize( this.props.theme, this.props.selectedSite );
		this.props.onClick( this.props.theme );
	},

	renderSiteSelector() {
		if ( ! this.state.selectedAction ) {
			return;
		}
		const selectedAction = this.state.selectedAction;
		const onCompleteSiteSelection = ( selectedTheme, site ) => {
			this.props[ selectedAction ]( selectedTheme, site, 'showcase-sheet' );
			this.props.onClick( this.props.theme );
		};
		// TODO: this used to be `section`, but I don't know what that is or if it
		// is needed. Obviously there won't be a `site` if we're calling this function.
		const site = this.props.selectedSite ? this.props.selectedSite.ID : null;
		return (
			<ThemesSiteSelectorModal
				name={ this.state.selectedAction }
				label={ actionLabels[ this.state.selectedAction ].label }
				header={ actionLabels[ this.state.selectedAction ].header }
				selectedTheme={ this.props.theme }
				onHide={ this.hideSiteSelectorModal }
				action={ onCompleteSiteSelection }
				sourcePath={ `/theme/${ this.props.theme.id }${ site ? '/' + site : '' }` }
			/>
		);
	},

	render() {
		const isThemeActive = this.isThemeActive();
		const price = this.props.theme.price ? this.props.theme.price : i18n.translate( 'Free' );
		const buttonText = ( isThemeActive ? i18n.translate( 'Customize' ) : i18n.translate( 'Pick this design' ) );
		const priceElement = <span>{ buttonText }<span className="theme-pick-button__cost">{ price }</span></span>;
		const buttonLabel = ( isThemeActive ? buttonText : priceElement );
		const onButtonClick = ( isThemeActive ? this.onCustomize : this.onPickTheme );
		return (
			<Button className={ classNames( 'theme-pick-button', this.props.className ) } onClick={ onButtonClick }>
				{ buttonLabel }
				{ this.renderSiteSelector() }
			</Button>
		);
	}
} );

export default connect(
	// props
	state => {
		const selectedSite = getSelectedSite( state );
		const currentTheme = getCurrentTheme( state, selectedSite && selectedSite.ID );
		const isLoggedIn = !! getCurrentUser( state );
		return { selectedSite, currentTheme, isLoggedIn };
	},
	// Actions
	{ signup, purchase, activate, customize }
)( ThemePickButton );

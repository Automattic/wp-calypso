import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, Gridicon, Spinner } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { preventWidows } from 'calypso/lib/formatting';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import {
	acceptAutoLoadingHomepageWarning,
	hideAutoLoadingHomepageWarning,
	activate as activateTheme,
} from 'calypso/state/themes/actions';
import {
	getCanonicalTheme,
	hasActivatedTheme,
	themeHasAutoLoadingHomepage,
	isActivatingTheme,
	isThemeActive,
	shouldShowHomepageWarning,
	getPreActivateThemeId,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './auto-loading-homepage-modal.scss';

class AutoLoadingHomepageModal extends Component {
	static propTypes = {
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		theme: PropTypes.shape( {
			author: PropTypes.string,
			author_uri: PropTypes.string,
			id: PropTypes.string,
			name: PropTypes.string,
		} ),
		hasActivated: PropTypes.bool.isRequired,
		isActivating: PropTypes.bool.isRequired,
		hasAutoLoadingHomepage: PropTypes.bool,
		siteId: PropTypes.number,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func,
		installingThemeId: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			homepageAction: 'keep_current_homepage',
			// Used to reset state when dialog re-opens, see `getDerivedStateFromProps`
			wasVisible: props.isVisible,
			// Don't render the iframe on mobile; Doing it here prevents unnecessary data fetching vs. CSS.
			isNarrow: isWithinBreakpoint( '<782px' ),
		};
	}

	componentDidMount() {
		// Change the isNarrow state when the size of the browser changes.
		// (Putting this on an attribute instead of state because of react/no-did-mount-set-state)
		this.unsubscribe = subscribeIsWithinBreakpoint( '<782px', ( isNarrow ) =>
			this.setState( { isNarrow } )
		);
	}

	componentWillUnmount() {
		if ( typeof this.unsubscribe === 'function' ) {
			this.unsubscribe();
		}
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		// This component doesn't unmount when the dialog closes, so the state
		// needs to be reset back to defaults each time it opens.
		// Reseting `homepageAction` ensures the default option will be selected.
		if ( nextProps.isVisible && ! prevState.wasVisible ) {
			return { homepageAction: 'keep_current_homepage', wasVisible: true };
		} else if ( ! nextProps.isVisible && prevState.wasVisible ) {
			return { wasVisible: false };
		}
		return null;
	}

	handleHomepageAction = ( event ) => {
		this.setState( { homepageAction: event.currentTarget.value } );
	};

	closeModalHandler =
		( action = 'dismiss' ) =>
		() => {
			const { installingThemeId, siteId, source } = this.props;
			if ( 'activeTheme' === action ) {
				this.props.acceptAutoLoadingHomepageWarning( installingThemeId );
				const keepCurrentHomepage = this.state.homepageAction === 'keep_current_homepage';
				recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_activate_click', {
					theme: installingThemeId,
					keep_current_homepage: keepCurrentHomepage,
				} );
				return this.props.activateTheme(
					installingThemeId,
					siteId,
					source,
					false,
					keepCurrentHomepage
				);
			} else if ( 'keepCurrentTheme' === action ) {
				recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_dismiss', {
					action: 'button',
					theme: installingThemeId,
				} );
				return this.props.hideAutoLoadingHomepageWarning();
			} else if ( 'dismiss' === action ) {
				recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_dismiss', {
					action: 'escape',
					theme: installingThemeId,
				} );
				return this.props.hideAutoLoadingHomepageWarning();
			}
		};

	render() {
		const {
			theme,
			hasActivated,
			isActivating,
			hasAutoLoadingHomepage,
			isCurrentTheme,
			isVisible = false,
		} = this.props;
		const { isNarrow } = this.state;

		// Nothing to do when it's the current theme.
		if ( isCurrentTheme ) {
			return null;
		}

		// Nothing to show if the theme doesn't have auto loading homepage.
		if ( ! hasAutoLoadingHomepage ) {
			return null;
		}

		// Hide while is activating or when it's activated.
		if ( isActivating || hasActivated ) {
			return null;
		}

		if ( ! theme ) {
			return null;
		}

		const {
			name: themeName,
			id: themeId,
			stylesheet,
			screenshot: themeScreenshot,
		} = this.props.theme;

		const iframeSrcKeepHomepage = `//${ this.props.siteDomain }?theme=${ encodeURIComponent(
			stylesheet
		) }&hide_banners=true&preview_overlay=true`;

		return (
			<Dialog
				className="themes__auto-loading-homepage-modal"
				isVisible={ isVisible }
				buttons={ [
					{
						action: 'keepCurrentTheme',
						label: translate( 'Keep my current theme' ),
						isPrimary: false,
						onClick: this.closeModalHandler( 'keepCurrentTheme' ),
					},
					{
						action: 'activeTheme',
						label: translate( 'Activate %(themeName)s', { args: { themeName } } ),
						isPrimary: true,
						onClick: this.closeModalHandler( 'activeTheme' ),
					},
				] }
				onClose={ this.closeModalHandler( 'dismiss' ) }
			>
				<Gridicon
					icon="cross"
					className="themes__auto-loading-homepage-modal-close-icon"
					onClick={ this.closeModalHandler( 'dismiss' ) }
				/>
				<TrackComponentView
					eventName={ 'calypso_theme_autoloading_homepage_modal_view' }
					eventProperties={ { theme: themeId } }
				/>
				<div className="themes__theme-preview-wrapper">
					<h1>
						{ translate( 'How would you like to use %(themeName)s?', {
							args: { themeName },
						} ) }
					</h1>
					<div className="themes__theme-preview-items">
						<div className="themes__theme-preview-item themes__theme-preview-item-iframe-container">
							<FormLabel>
								<div className="themes__iframe-wrapper">
									<Spinner />
									{ ! isNarrow && (
										<iframe
											scrolling="no"
											loading="lazy"
											title={ translate( 'Preview of current homepage with new theme applied' ) }
											src={ iframeSrcKeepHomepage }
										/>
									) }
								</div>
								<FormRadio
									value="keep_current_homepage"
									checked={ 'keep_current_homepage' === this.state.homepageAction }
									onChange={ this.handleHomepageAction }
									label={ preventWidows(
										translate( 'Switch theme, preserving my homepage content.' )
									) }
								/>
							</FormLabel>
						</div>
						<div className="themes__theme-preview-item">
							<FormLabel>
								<div className="themes__theme-preview-image-wrapper">
									<img
										src={ themeScreenshot }
										alt={ translate( "Preview of new theme's default homepage" ) }
									/>
								</div>
								<FormRadio
									value="use_new_homepage"
									checked={ 'use_new_homepage' === this.state.homepageAction }
									onChange={ this.handleHomepageAction }
									label={ preventWidows(
										translate( 'Replace my homepage content with the %(themeName)s homepage.', {
											args: { themeName },
										} )
									) }
								/>
							</FormLabel>
						</div>
					</div>
					<div className="themes__autoloading-homepage-option-description">
						{ this.state.homepageAction === 'keep_current_homepage' && (
							<p>
								{ preventWidows(
									translate(
										'Your new theme design will be applied without changing your homepage content.'
									)
								) }{ ' ' }
								<ExternalLink
									href={ localizeUrl( 'https://wordpress.com/support/changing-themes/' ) }
									icon
									target="__blank"
								>
									{ translate( 'Learn more.' ) }
								</ExternalLink>
							</p>
						) }
						{ this.state.homepageAction === 'use_new_homepage' && (
							<p>
								<span
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={ {
										__html: preventWidows(
											translate(
												'After activation, you can still access your old homepage content under Pages &rarr; Drafts.'
											)
										),
									} }
								/>{ ' ' }
								<ExternalLink
									href={ localizeUrl( 'https://wordpress.com/support/changing-themes/' ) }
									icon
									target="__blank"
								>
									{ translate( 'Learn more.' ) }
								</ExternalLink>
							</p>
						) }
					</div>
				</div>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const installingThemeId = getPreActivateThemeId( state );

		return {
			siteId,
			siteDomain: getSiteDomain( state, siteId ),
			installingThemeId,
			theme: installingThemeId && getCanonicalTheme( state, siteId, installingThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			hasAutoLoadingHomepage: themeHasAutoLoadingHomepage( state, installingThemeId, siteId ),
			isCurrentTheme: isThemeActive( state, installingThemeId, siteId ),
			isVisible: shouldShowHomepageWarning( state, installingThemeId ),
		};
	},
	{
		acceptAutoLoadingHomepageWarning,
		hideAutoLoadingHomepageWarning,
		activateTheme,
		recordTracksEvent,
	}
)( AutoLoadingHomepageModal );

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { Card, Dialog } from '@automattic/components';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import ExternalLink from 'calypso/components/external-link';
import Gridicon from 'calypso/components/gridicon';
import Spinner from 'calypso/components/spinner';
import {
	getActiveTheme,
	getCanonicalTheme,
	hasActivatedTheme,
	themeHasAutoLoadingHomepage,
	isActivatingTheme,
	isThemeActive,
	isUsingRetiredTheme,
	getPreActivateThemeId,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import {
	acceptActivateModalWarning,
	hideActivateModalWarning,
	activate as activateTheme,
} from 'calypso/state/themes/actions';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './theme-activation-confirmation-modal.scss';

class ThemeActivationConfirmationModal extends Component {
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
		isCurrentThemeRetired: PropTypes.bool,
		onClose: PropTypes.func,
		installingThemeId: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			homepageAction: 'keep_current_homepage',
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

	handleHomepageAction = ( event ) => {
		this.setState( { homepageAction: event.currentTarget.value } );
	};

	closeModalHandler = ( action = 'dismiss' ) => () => {
		const {
			hasAutoLoadingHomepage,
			installingThemeId,
			isCurrentThemeRetired,
			siteId,
			source,
		} = this.props;
		const isSolelyRetiredThemeModal = isCurrentThemeRetired && ! hasAutoLoadingHomepage;

		if ( 'activeTheme' === action ) {
			this.props.acceptActivateModalWarning( installingThemeId );
			const keepCurrentHomepage = this.state.homepageAction === 'keep_current_homepage';
			recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_activate_click', {
				theme: installingThemeId,
				keep_current_homepage: keepCurrentHomepage,
			} );
			if ( isSolelyRetiredThemeModal ) {
				recordTracksEvent( 'calypso_theme_retired_theme_modal_activate_click', {
					theme: installingThemeId,
				} );
			}
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

			if ( isSolelyRetiredThemeModal ) {
				recordTracksEvent( 'calypso_theme_retired_theme_modal_dismiss', {
					action: 'button',
					theme: installingThemeId,
				} );
			}
			return this.props.hideActivateModalWarning();
		} else if ( 'dismiss' === action ) {
			recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_dismiss', {
				action: 'escape',
				theme: installingThemeId,
			} );
			return this.props.hideActivateModalWarning();
		}
	};
	render() {
		const {
			activeTheme,
			installingTheme,
			hasActivated,
			isActivating,
			hasAutoLoadingHomepage,
			isCurrentTheme,
			isCurrentThemeRetired,
			siteDomain,
		} = this.props;
		const { isNarrow } = this.state;

		// Nothing to do when it's the current theme.
		if ( isCurrentTheme ) {
			return null;
		}

		// Hide while is activating or when it's activated.
		if ( isActivating || hasActivated ) {
			return null;
		}

		if ( ! installingTheme ) {
			return null;
		}

		const { stylesheet, screenshot: themeScreenshot } = installingTheme;
		const themeName = isCurrentThemeRetired ? activeTheme.name : installingTheme.name;

		const iframeSrcKeepHomepage = `//${ siteDomain }?theme=${ encodeURIComponent(
			stylesheet
		) }&hide_banners=true&preview_overlay=true`;

		const classes = classNames( 'theme-activation-confirmation-modal', {
			'is-solely-retired-modal': isCurrentThemeRetired && ! hasAutoLoadingHomepage,
		} );

		const retiredMessage = translate(
			'Please note that {{strong}}%(themeName)s{{/strong}} is retired and no longer supported, so you might not be able to switch back. {{supportLink/}}',
			{
				args: {
					themeName,
				},
				components: {
					strong: <strong />,
					supportLink: (
						<ExternalLink
							target="_blank"
							icon
							href={ 'https://wordpress.com/support/themes/#retired-themes' }
						>
							{ translate( 'Learn more.' ) }
						</ExternalLink>
					),
				},
			}
		);

		let dialogHeading;

		if ( hasAutoLoadingHomepage ) {
			dialogHeading = translate( 'How would you like to use %(themeName)s on your site?', {
				args: { themeName: installingTheme.name },
			} );
		} else if ( isCurrentThemeRetired ) {
			dialogHeading = retiredMessage;
		}

		return (
			<Dialog
				className={ classes }
				isVisible
				baseClassName="theme-activation-confirmation-modal__dialog dialog"
				buttons={ [
					{
						action: 'keepCurrentTheme',
						label: translate( 'Keep my current theme' ),
						isPrimary: false,
						onClick: this.closeModalHandler( 'keepCurrentTheme' ),
					},
					{
						action: 'activeTheme',
						label: translate( 'Activate %(themeName)s', {
							args: { themeName: installingTheme.name },
						} ),
						isPrimary: true,
						onClick: this.closeModalHandler( 'activeTheme' ),
					},
				] }
				onClose={ this.closeModalHandler( 'dismiss' ) }
			>
				<Gridicon
					icon="cross"
					className="theme-activation-confirmation-modal__close-icon"
					onClick={ this.closeModalHandler( 'dismiss' ) }
				/>
				<TrackComponentView
					eventName={ 'calypso_theme_autoloading_homepage_modal_view' }
					eventProperties={ {
						theme: installingTheme.id,
					} }
				/>
				{ isCurrentThemeRetired && hasAutoLoadingHomepage && (
					<TrackComponentView
						eventName={
							'calypso_theme_activation_retired_and_autoloading_homepage_confirmation_modal_view'
						}
						eventProperties={ {
							theme: installingTheme.id,
						} }
					/>
				) }
				<div className="themes__theme-preview-wrapper">
					<h1 className="theme-activation-confirmation-modal__title">{ dialogHeading }</h1>
					{ hasAutoLoadingHomepage && isCurrentThemeRetired && (
						<Card className="theme-activation-confirmation-modal__retired-card" highlight="warning">
							{ retiredMessage }
						</Card>
					) }
					{ hasAutoLoadingHomepage && (
						<div>
							<div className="themes__theme-preview-items">
								<div className="themes__theme-preview-item themes__theme-preview-item-iframe-container">
									<FormLabel>
										<div className="themes__iframe-wrapper">
											<Spinner />
											{ ! isNarrow && (
												<iframe
													scrolling="no"
													loading="lazy"
													title={ translate(
														'Preview of current homepage with new theme applied'
													) }
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
													args: { themeName: installingTheme.name },
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
					) }
				</div>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const activeThemeId = getActiveTheme( state, siteId );
		const installingThemeId = getPreActivateThemeId( state );

		return {
			siteId,
			siteDomain: getSiteDomain( state, siteId ),
			activeThemeId,
			installingThemeId,
			activeTheme: activeThemeId && getCanonicalTheme( state, siteId, activeThemeId ),
			installingTheme: installingThemeId && getCanonicalTheme( state, siteId, installingThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			hasAutoLoadingHomepage: themeHasAutoLoadingHomepage( state, installingThemeId ),
			isCurrentTheme: isThemeActive( state, installingThemeId, siteId ),
			isCurrentThemeRetired: isUsingRetiredTheme( state, siteId ),
		};
	},
	{
		acceptActivateModalWarning,
		hideActivateModalWarning,
		activateTheme,
		recordTracksEvent,
	}
)( ThemeActivationConfirmationModal );

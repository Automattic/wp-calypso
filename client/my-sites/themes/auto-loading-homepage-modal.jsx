import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, Gridicon, Button, ScreenReaderText } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CheckboxControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
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

export class AutoLoadingHomepageModal extends Component {
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
			// Used to reset state when dialog re-opens, see `getDerivedStateFromProps`
			wasVisible: props.isVisible,
			hasConfirmed: false,
		};
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		// This component doesn't unmount when the dialog closes, so the state
		// needs to be reset back to defaults each time it opens.
		if ( nextProps.isVisible && ! prevState.wasVisible ) {
			return { wasVisible: true };
		} else if ( ! nextProps.isVisible && prevState.wasVisible ) {
			return { wasVisible: false };
		}
		return null;
	}

	closeModalHandler =
		( action = 'dismiss' ) =>
		() => {
			const { installingThemeId, siteId, source } = this.props;
			if ( 'activeTheme' === action ) {
				this.props.acceptAutoLoadingHomepageWarning( installingThemeId );

				/**
				 * We don't want to keep the current homepage since it's "broken" for now.
				 * Update this when we find a way to improve the theme switch experience as a whole.
				 */
				const keepCurrentHomepage = false;

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

		const { hasConfirmed } = this.state;

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

		const { name: themeName, id: themeId } = this.props.theme;

		return (
			<Dialog
				className="themes__auto-loading-homepage-modal"
				isVisible={ isVisible }
				onClose={ this.closeModalHandler( 'dismiss' ) }
			>
				<TrackComponentView
					eventName="calypso_theme_autoloading_homepage_modal_view"
					eventProperties={ { theme: themeId } }
				/>
				<Button
					className="themes__auto-loading-homepage-modal-close-icon"
					borderless
					onClick={ this.closeModalHandler( 'dismiss' ) }
				>
					<Gridicon icon="cross" size={ 12 } />
					<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
				</Button>
				<div className="themes__theme-preview-wrapper">
					<h1 className="auto-loading-homepage-modal__heading">
						{ translate( 'Activate %(themeName)s', {
							args: { themeName },
						} ) }
					</h1>
					<p className="auto-loading-homepage-modal__description">
						{ translate(
							'After activation, this layout will replace your existing homepage. But you can still access your old content. {{a}}Learn more{{/a}}.',
							{
								components: {
									a: (
										<a
											href={ localizeUrl( 'https://wordpress.com/support/themes/changing-themes' ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
					<CheckboxControl
						className="auto-loading-homepage-modal__checkbox"
						label={ translate(
							'I understand that this layout will replace my existing homepage.'
						) }
						checked={ hasConfirmed }
						onChange={ () => this.setState( { hasConfirmed: ! hasConfirmed } ) }
					/>
					<div className="auto-loading-homepage-modal__actions">
						<Button
							primary
							onClick={ this.closeModalHandler( 'activeTheme' ) }
							disabled={ ! hasConfirmed }
						>
							{ translate( 'Activate %(themeName)s', {
								args: { themeName },
							} ) }
						</Button>
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

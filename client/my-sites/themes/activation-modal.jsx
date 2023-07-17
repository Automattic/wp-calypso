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
	acceptActivationModal,
	dismissActivationModal,
	activate as activateTheme,
} from 'calypso/state/themes/actions';
import {
	getCanonicalTheme,
	isActivatingTheme,
	isThemeActive,
	shouldShowActivationModal,
	getThemeIdToActivate,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './activation-modal.scss';

export class ActivationModal extends Component {
	static propTypes = {
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		theme: PropTypes.shape( {
			author: PropTypes.string,
			author_uri: PropTypes.string,
			id: PropTypes.string,
			name: PropTypes.string,
		} ),
		isActivating: PropTypes.bool.isRequired,
		siteId: PropTypes.number,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func,
		installingThemeId: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			hasConfirmed: false,
		};
	}

	closeModalHandler =
		( action = 'dismiss' ) =>
		() => {
			const { installingThemeId, siteId, source } = this.props;
			if ( 'activeTheme' === action ) {
				this.props.acceptActivationModal( installingThemeId );

				/**
				 * We don't want to keep the current homepage since it's "broken" for now.
				 * Update this when we find a way to improve the theme switch experience as a whole.
				 *
				 * @see pbxlJb-3Uv-p2
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
				return this.props.dismissActivationModal();
			}
		};

	render() {
		const { theme, isActivating, isCurrentTheme, isVisible = false } = this.props;

		const { hasConfirmed } = this.state;

		// Nothing to do when it's the current theme.
		if ( isCurrentTheme ) {
			return null;
		}

		// Hide while is activating.
		if ( isActivating ) {
			return null;
		}

		if ( ! theme ) {
			return null;
		}

		const { name: themeName, id: themeId } = this.props.theme;

		return (
			<Dialog
				className="themes__activation-modal"
				isVisible={ isVisible }
				onClose={ this.closeModalHandler( 'dismiss' ) }
			>
				<TrackComponentView
					eventName="calypso_theme_autoloading_homepage_modal_view"
					eventProperties={ { theme: themeId } }
				/>
				<Button
					className="themes__activation-modal-close-icon"
					borderless
					onClick={ this.closeModalHandler( 'dismiss' ) }
				>
					<Gridicon icon="cross" size={ 12 } />
					<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
				</Button>
				<div className="themes__theme-preview-wrapper">
					<h1 className="activation-modal__heading">
						{ translate( 'Activate %(themeName)s', {
							args: { themeName },
						} ) }
					</h1>
					<p className="activation-modal__description">
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
						className="activation-modal__checkbox"
						label={ translate(
							'I understand that this layout will replace my existing homepage.'
						) }
						checked={ hasConfirmed }
						onChange={ () => this.setState( { hasConfirmed: ! hasConfirmed } ) }
					/>
					<div className="activation-modal__actions">
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
		const installingThemeId = getThemeIdToActivate( state );

		return {
			siteId,
			siteDomain: getSiteDomain( state, siteId ),
			installingThemeId,
			theme: installingThemeId && getCanonicalTheme( state, siteId, installingThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			isCurrentTheme: isThemeActive( state, installingThemeId, siteId ),
			isVisible: shouldShowActivationModal( state, installingThemeId ),
		};
	},
	{
		acceptActivationModal,
		dismissActivationModal,
		activateTheme,
		recordTracksEvent,
	}
)( ActivationModal );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, Gridicon, Button, ScreenReaderText } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
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
	getActiveTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './activation-modal.scss';

const SiteIntent = Onboard.SiteIntent;

export class ActivationModal extends Component {
	static propTypes = {
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		siteIntent: PropTypes.string,
		newTheme: PropTypes.shape( {
			id: PropTypes.string,
			name: PropTypes.string,
		} ),
		activeTheme: PropTypes.shape( {
			name: PropTypes.string,
		} ),
		isActivating: PropTypes.bool.isRequired,
		siteId: PropTypes.number,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func,
		newThemeId: PropTypes.string,
	};

	closeModalHandler =
		( action = 'dismiss' ) =>
		() => {
			const { newThemeId, siteId, source } = this.props;
			if ( 'activeTheme' === action ) {
				this.props.acceptActivationModal( newThemeId );

				recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_activate_click', {
					theme: newThemeId,
				} );
				return this.props.activateTheme( newThemeId, siteId, { source } );
			} else if ( 'dismiss' === action ) {
				recordTracksEvent( 'calypso_theme_autoloading_homepage_modal_dismiss', {
					action: 'escape',
					theme: newThemeId,
				} );
				return this.props.dismissActivationModal();
			}
		};

	render() {
		const {
			newTheme,
			activeTheme,
			isActivating,
			isCurrentTheme,
			siteIntent,
			isVisible = false,
		} = this.props;

		// Nothing to do when it's the current theme.
		if ( isCurrentTheme ) {
			return null;
		}

		// Hide while is activating.
		if ( isActivating ) {
			return null;
		}

		if ( ! newTheme || ! activeTheme ) {
			return null;
		}

		const isAIAssembler = siteIntent === SiteIntent.AIAssembler && activeTheme.id === 'assembler';
		const translationArgs = {
			args: {
				activeThemeName: activeTheme.name,
				newThemeName: newTheme.name,
			},
			components: {
				a: (
					<a
						href={ localizeUrl(
							'https://wordpress.com/support/themes/changing-themes/#what-happens-to-your-old-content'
						) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				br: <br />,
				strong: <strong />,
			},
		};

		const message = isAIAssembler
			? translate(
					'{{strong}}%(newThemeName)s{{/strong}} is currently not compatible with our AI Website Builder. Changing to this theme means you can no longer use our AI Website Builder on this site.{{br}}{{/br}}{{br}}{{/br}}Additionally, your homepage will be replaced but your content will remain accessible. {{a}}Learn more{{/a}}.',
					translationArgs
			  )
			: translate(
					'You’re about to change your active theme from {{strong}}%(activeThemeName)s{{/strong}} to {{strong}}%(newThemeName)s{{/strong}}.{{br}}{{/br}}{{br}}{{/br}}This will replace your homepage, but your content will remain accessible. {{a}}Learn more{{/a}}.',
					translationArgs
			  );

		return (
			<Dialog
				className="themes__activation-modal"
				isVisible={ isVisible }
				onClose={ this.closeModalHandler( 'dismiss' ) }
			>
				<TrackComponentView
					eventName="calypso_theme_autoloading_homepage_modal_view"
					eventProperties={ { theme: newTheme.id } }
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
							args: { themeName: newTheme.name },
						} ) }
					</h1>
					<p className="activation-modal__description">{ message }</p>
					<div className="activation-modal__actions">
						<Button primary onClick={ this.closeModalHandler( 'activeTheme' ) }>
							{ translate( 'Activate %(themeName)s', {
								args: { themeName: newTheme.name },
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
		const newThemeId = getThemeIdToActivate( state );
		const activeThemeId = getActiveTheme( state, siteId );

		return {
			siteId,
			siteDomain: getSiteDomain( state, siteId ),
			newThemeId,
			newTheme: newThemeId && getCanonicalTheme( state, siteId, newThemeId ),
			activeTheme: activeThemeId && getCanonicalTheme( state, siteId, activeThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			isCurrentTheme: isThemeActive( state, newThemeId, siteId ),
			isVisible: shouldShowActivationModal( state, newThemeId ),
		};
	},
	{
		acceptActivationModal,
		dismissActivationModal,
		activateTheme,
		recordTracksEvent,
	}
)( ActivationModal );

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import {
	getActiveTheme,
	getCanonicalTheme,
	hasActivatedTheme,
	themeHasAutoLoadingHomepage,
	isActivatingTheme,
	isUsingRetiredTheme,
	isThemeActive,
	getPreActivateThemeId,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	acceptAutoLoadingHomepageWarning,
	hideAutoLoadingHomepageWarning,
	activate as activateTheme,
} from 'calypso/state/themes/actions';

/**
 * Style dependencies
 */
import './theme-activation-confirmation-modal.scss';

class ThemeActivationConfirmationModal extends Component {
	static propTypes = {
		source: PropTypes.oneOf(['details', 'list', 'upload']).isRequired,
		theme: PropTypes.shape({
			author: PropTypes.string,
			author_uri: PropTypes.string,
			id: PropTypes.string,
			name: PropTypes.string,
		}),
		hasActivated: PropTypes.bool.isRequired,
		isActivating: PropTypes.bool.isRequired,
		hasAutoLoadingHomepage: PropTypes.bool,
		siteId: PropTypes.number,
		isCurrentThemeRetired: PropTypes.bool,
		onClose: PropTypes.func,
		installingThemeId: PropTypes.string,
	};

	constructor(props) {
		super(props);
		this.state = {
			homepageAction: 'keep_current_homepage',

			// Used to reset state when dialog re-opens, see `getDerivedStateFromProps`
			wasVisible: props.isVisible,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		// This component doesn't unmount when the dialog closes, so the state
		// needs to be reset back to defaults each time it opens.
		// Reseting `homepageAction` ensures the default option will be selected.
		if (nextProps.isVisible && !prevState.wasVisible) {
			return { homepageAction: 'keep_current_homepage', wasVisible: true };
		} else if (!nextProps.isVisible && prevState.wasVisible) {
			return { wasVisible: false };
		}
		return null;
	}

	handleHomepageAction = (event) => {
		this.setState({ homepageAction: event.currentTarget.value });
	};

	closeModalHandler =
		(action = 'dismiss') =>
		() => {
			const { installingThemeId, siteId, source } = this.props;
			if ('activeTheme' === action) {
				this.props.acceptAutoLoadingHomepageWarning(installingThemeId);
				const keepCurrentHomepage = this.state.homepageAction === 'keep_current_homepage';
				recordTracksEvent('calypso_theme_autoloading_homepage_modal_activate_click', {
					theme: installingThemeId,
					keep_current_homepage: keepCurrentHomepage,
				});
				return this.props.activateTheme(
					installingThemeId,
					siteId,
					source,
					false,
					keepCurrentHomepage
				);
			} else if ('keepCurrentTheme' === action) {
				recordTracksEvent('calypso_theme_autoloading_homepage_modal_dismiss', {
					action: 'button',
					theme: installingThemeId,
				});
				return this.props.hideAutoLoadingHomepageWarning();
			} else if ('dismiss' === action) {
				recordTracksEvent('calypso_theme_autoloading_homepage_modal_dismiss', {
					action: 'escape',
					theme: installingThemeId,
				});
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
			isCurrentThemeRetired,
		} = this.props;

		// Nothing to do when it's the current theme.
		if (isCurrentTheme) {
			return null;
		}

		// Hide while is activating or when it's activated.
		if (isActivating || hasActivated) {
			return null;
		}

		if (!theme) {
			return null;
		}

		const themeName = isCurrentThemeRetired
			? this.props.activeThemeName
			: this.props.installingThemeName;

		const themeId = isCurrentThemeRetired
			? this.props.activeThemeName
			: this.props.installingThemeName;

		let dialogMessage;

		if (isCurrentThemeRetired) {
			dialogMessage = translate(
				'Your active theme {{strong}}%(themeName)s{{/strong}} is retired. ' +
					'If you activate a new theme, you might not be able to switch back to %(themeName)s.',
				{
					args: { themeName },
					components: { strong: <strong /> },
				}
			);
		} else if (hasAutoLoadingHomepage) {
			dialogMessage = translate(
				'{{strong}}%(themeName)s{{/strong}} will automatically change your homepage layout. ' +
					'Your current homepage will become a draft. Would you like to continue?',
				{
					args: { themeName },
					components: { strong: <strong /> },
				}
			);
		}

		return (
			<Dialog
				className="theme-activation-confirmation-modal"
				isVisible
				buttons={[
					{
						action: 'keepCurrentTheme',
						label: translate('Keep my current theme'),
						isPrimary: false,
						onClick: this.closeModalHandler('keepCurrentTheme'),
					},
					{
						action: 'activeTheme',
						label: translate('Activate %(themeName)s', { args: { themeName } }),
						isPrimary: true,
						onClick: this.closeModalHandler('activeTheme'),
					},
				]}
				onClose={this.closeModalHandler('dismiss')}
			>
				<TrackComponentView
					eventName={'calypso_theme_activation_confirmation_modal_view'}
					eventProperties={{ theme: themeId }}
				/>
				<div>
					<h1>
						<h1 className="theme-activation-confirmation-modal__title">{dialogMessage}</h1>
					</h1>
					{hasAutoLoadingHomepage && (
						<>
							<FormLabel>
								<FormRadio
									value="keep_current_homepage"
									checked={'keep_current_homepage' === this.state.homepageAction}
									onChange={this.handleHomepageAction}
									label={translate('Use %(themeName)s without changing my homepage content.', {
										args: { themeName },
									})}
								/>
							</FormLabel>
							<FormLabel>
								<FormRadio
									value="use_new_homepage"
									checked={'use_new_homepage' === this.state.homepageAction}
									onChange={this.handleHomepageAction}
									label={translate(
										"Use %(themeName)s's homepage content and make my existing homepage a draft.",
										{
											args: { themeName },
										}
									)}
								/>
							</FormLabel>
						</>
					)}
				</div>
			</Dialog>
		);
	}
}

export default connect(
	(state) => {
		const siteId = getSelectedSiteId(state);
		const installingThemeId = getPreActivateThemeId(state);
		const activeThemeId = getActiveTheme(state, siteId);

		return {
			siteId,
			activeThemeId,
			activeThemeName: get(state, 'themes.queries.wpcom.data.items.' + activeThemeId + '.name'),
			installingThemeName: get(
				state,
				'themes.queries.wpcom.data.items.' + installingThemeId + '.name'
			),
			installingThemeId,
			theme: installingThemeId && getCanonicalTheme(state, siteId, installingThemeId),
			isActivating: !!isActivatingTheme(state, siteId),
			hasActivated: !!hasActivatedTheme(state, siteId),
			hasAutoLoadingHomepage: themeHasAutoLoadingHomepage(state, installingThemeId),
			isCurrentTheme: isThemeActive(state, installingThemeId, siteId),
			isCurrentThemeRetired: isUsingRetiredTheme(state, siteId),
		};
	},
	{
		acceptAutoLoadingHomepageWarning,
		hideAutoLoadingHomepageWarning,
		activateTheme,
		recordTracksEvent,
	}
)(ThemeActivationConfirmationModal);

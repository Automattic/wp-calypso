/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import {
	getCanonicalTheme,
	getActiveTheme,
	hasActivatedTheme,
	themeHasAutoLoadingHomepage,
	isActivatingTheme,
	isThemeActive,
	getPreActivateThemeId,
	isUsingRetiredTheme,
} from 'state/themes/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	acceptAutoLoadingHomepageWarning,
	hideAutoLoadingHomepageWarning,
	activate as activateTheme,
} from 'state/themes/actions';

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

	closeModalHandler = ( activate = false ) => () => {
		if ( activate ) {
			const { installingThemeId, siteId, source } = this.props;
			this.props.acceptAutoLoadingHomepageWarning( installingThemeId );
			return this.props.activateTheme( installingThemeId, siteId, source );
		}
		this.props.hideAutoLoadingHomepageWarning();
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
		if ( isCurrentTheme ) {
			return null;
		}

		// Hide while is activating or when it's activated.
		if ( isActivating || hasActivated ) {
			return null;
		}

		if ( ! theme ) {
			return null;
		}

		const themeName = isCurrentThemeRetired
			? this.props.activeThemeName
			: this.props.installingThemeName;

		let dialogMessage;

		if ( isCurrentThemeRetired ) {
			dialogMessage = translate(
				'Your active theme {{strong}}%(themeName)s{{/strong}} is retired. ' +
					'If you activate a new theme, you might not be able to switch back to %(themeName)s.',
				{
					args: { themeName },
					components: { strong: <strong /> },
				}
			);
		} else if ( hasAutoLoadingHomepage ) {
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
				buttons={ [
					{
						action: 'keepCurrentTheme',
						label: translate( 'No, keep my current theme' ),
						isPrimary: false,
						onClick: this.closeModalHandler( false ),
					},
					{
						action: 'activeTheme',
						label: translate( 'Yes, activate %(themeName)s', {
							args: { themeName },
						} ),
						isPrimary: true,
						onClick: this.closeModalHandler( true ),
					},
				] }
				onClose={ this.closeModalHandler( false ) }
			>
				<div>
					<h1 className="theme-activation-confirmation-modal__title">{ dialogMessage }</h1>
				</div>
			</Dialog>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const installingThemeId = getPreActivateThemeId( state );
		const activeThemeId = getActiveTheme( state, siteId );

		return {
			siteId,
			installingThemeId,
			activeThemeId,
			activeThemeName: get( state, 'themes.queries.wpcom.data.items.' + activeThemeId + '.name' ),
			installingThemeName: get(
				state,
				'themes.queries.wpcom.data.items.' + installingThemeId + '.name'
			),
			theme: installingThemeId && getCanonicalTheme( state, siteId, installingThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			hasAutoLoadingHomepage: themeHasAutoLoadingHomepage( state, installingThemeId ),
			isCurrentThemeRetired: isUsingRetiredTheme( state, siteId ),
			isCurrentTheme: isThemeActive( state, installingThemeId, siteId ),
		};
	},
	{
		acceptAutoLoadingHomepageWarning,
		hideAutoLoadingHomepageWarning,
		activateTheme,
	}
)( ThemeActivationConfirmationModal );

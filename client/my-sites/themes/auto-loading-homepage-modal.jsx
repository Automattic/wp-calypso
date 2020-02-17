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
import {
	getCanonicalTheme,
	hasActivatedTheme,
	hasAutoLoadingHomepageFeature,
	isActivatingTheme,
	isThemeActive,
	shouldShowHomepageWarning,
	getPreInstallingThemeId,
} from 'state/themes/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	acceptSwitchingHomepageWarning,
	hideSwitchingHomepageWarning,
	activate as activateTheme,
} from 'state/themes/actions';

/**
 * Style dependencies
 */
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
		installingThemeId: PropTypes.string.isRequired,
	};

	onCloseModal = ( activate = false ) => {
		if ( activate ) {
			const { installingThemeId, siteId, source } = this.props;
			this.props.acceptSwitchingHomepageWarning( installingThemeId );
			return this.props.activateTheme( installingThemeId, siteId, source );
		}
		this.props.hideSwitchingHomepageWarning();
	};

	onClickButtonHandler = activate => () => this.onCloseModal( activate );

	render() {
		const {
			theme,
			hasActivated,
			isActivating,
			hasAutoLoadingHomepage,
			isCurrentTheme,
			isVisible = false,
		} = this.props;

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

		const { name: themeName } = this.props.theme;

		return (
			<Dialog
				className="themes__auto-loading-homepage-modal"
				isVisible={ isVisible }
				buttons={ [
					{
						action: 'keepCurrentTheme',
						label: translate( 'No, keep my current theme' ),
						isPrimary: false,
						onClick: this.onClickButtonHandler( false ),
					},
					{
						action: 'activeTheme',
						label: translate( 'Yes, active %(themeName)s', {
							args: { themeName },
						} ),
						isPrimary: true,
						onClick: this.onClickButtonHandler( true ),
					},
				] }
				onClose={ this.onClickButtonHandler( false ) }
			>
				<div>
					<h1>
						{ translate(
							'Activating %(themeName)s will move your existing homepage to draft. Would you like to continue?',
							{
								args: { themeName },
							}
						) }
					</h1>
				</div>
			</Dialog>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const installingThemeId = getPreInstallingThemeId( state );

		return {
			siteId,
			installingThemeId,
			theme: installingThemeId && getCanonicalTheme( state, siteId, installingThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			hasAutoLoadingHomepage: hasAutoLoadingHomepageFeature( state, installingThemeId ),
			isCurrentTheme: isThemeActive( state, installingThemeId, siteId ),
			isVisible: shouldShowHomepageWarning( state, installingThemeId ),
		};
	},
	{
		acceptSwitchingHomepageWarning,
		hideSwitchingHomepageWarning,
		activateTheme,
	}
)( AutoLoadingHomepageModal );

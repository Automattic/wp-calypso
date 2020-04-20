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
	themeHasAutoLoadingHomepage,
	isActivatingTheme,
	isThemeActive,
	shouldShowHomepageWarning,
	getPreActivateThemeId,
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
						onClick: this.closeModalHandler( false ),
					},
					{
						action: 'activeTheme',
						label: translate( 'Yes, Activate %(themeName)s', {
							args: { themeName },
						} ),
						isPrimary: true,
						onClick: this.closeModalHandler( true ),
					},
				] }
				onClose={ this.closeModalHandler( false ) }
			>
				<div>
					<h1 className="themes__auto-loading-homepage-modal-title">
						{ translate(
							'{{strong}}%(themeName)s{{/strong}} will automatically change your homepage layout. ' +
								'Your current homepage will become a draft. Would you like to continue?',
							{
								args: { themeName },
								components: { strong: <strong /> },
							}
						) }
					</h1>
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
			installingThemeId,
			theme: installingThemeId && getCanonicalTheme( state, siteId, installingThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			hasAutoLoadingHomepage: themeHasAutoLoadingHomepage( state, installingThemeId ),
			isCurrentTheme: isThemeActive( state, installingThemeId, siteId ),
			isVisible: shouldShowHomepageWarning( state, installingThemeId ),
		};
	},
	{
		acceptAutoLoadingHomepageWarning,
		hideAutoLoadingHomepageWarning,
		activateTheme,
	}
)( AutoLoadingHomepageModal );

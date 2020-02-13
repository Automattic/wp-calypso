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
	isWpcomTheme,
} from 'state/themes/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './switching-homepage-modal.scss';

class SwitchingHomepageModal extends Component {
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
		isThemeWpCom: PropTypes.bool.isRequired,
		siteId: PropTypes.number,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func,
	};

	onCloseModal = ( activate = false ) => {
		if ( this.props.onClose ) {
			this.props.onClose( activate );
		}
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
				className="themes__switching-homepage-modal"
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

export default connect( ( state, { themeId } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		theme: themeId && getCanonicalTheme( state, siteId, themeId ),
		isActivating: !! isActivatingTheme( state, siteId ),
		hasActivated: !! hasActivatedTheme( state, siteId ),
		hasAutoLoadingHomepage: hasAutoLoadingHomepageFeature( state, themeId ),
		isThemeWpCom: isWpcomTheme( state, themeId ),
		isCurrentTheme: isThemeActive( state, themeId, siteId ),
	};
} )( SwitchingHomepageModal );

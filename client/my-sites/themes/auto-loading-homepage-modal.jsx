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
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
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
import {
	acceptAutoLoadingHomepageWarning,
	hideAutoLoadingHomepageWarning,
	activate as activateTheme,
} from 'calypso/state/themes/actions';

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
		installingThemeId: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			homepageAction: 'keep_current_homepage',

			// Used to reset state when dialog re-opens, see `getDerivedStateFromProps`
			wasVisible: props.isVisible,
		};
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

	closeModalHandler = ( activate = false ) => () => {
		if ( activate ) {
			const { installingThemeId, siteId, source } = this.props;
			this.props.acceptAutoLoadingHomepageWarning( installingThemeId );
			const keepCurrentHomepage = this.state.homepageAction === 'keep_current_homepage';
			return this.props.activateTheme(
				installingThemeId,
				siteId,
				source,
				false,
				keepCurrentHomepage
			);
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
						label: translate( 'Keep my current theme' ),
						isPrimary: false,
						onClick: this.closeModalHandler( false ),
					},
					{
						action: 'activeTheme',
						label: translate( 'Activate %(themeName)s', { args: { themeName } } ),
						isPrimary: true,
						onClick: this.closeModalHandler( true ),
					},
				] }
				onClose={ this.closeModalHandler( false ) }
			>
				<div>
					<h1>
						{ translate( 'How would you like to use %(themeName)s on your site?', {
							args: { themeName },
						} ) }
					</h1>
					<FormLabel>
						<FormRadio
							value="keep_current_homepage"
							checked={ 'keep_current_homepage' === this.state.homepageAction }
							onChange={ this.handleHomepageAction }
							label={ translate( 'Use %(themeName)s without changing my homepage content.', {
								args: { themeName },
							} ) }
						/>
					</FormLabel>
					<FormLabel>
						<FormRadio
							value="use_new_homepage"
							checked={ 'use_new_homepage' === this.state.homepageAction }
							onChange={ this.handleHomepageAction }
							label={ translate(
								"Use %(themeName)s's homepage content and make my existing homepage a draft.",
								{
									args: { themeName },
								}
							) }
						/>
					</FormLabel>
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

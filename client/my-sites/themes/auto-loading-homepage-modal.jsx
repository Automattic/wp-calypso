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
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
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
import getSiteOptions from 'state/selectors/get-site-options';
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
		installingThemeId: PropTypes.string,
	};

	state = {
		homepageAction: 'keep_latest_posts',
	};

	handleHomepageAction = ( event ) => {
		this.setState( { homepageAction: event.currentTarget.value } );
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
			siteOptions: { show_on_front },
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
						label:
							show_on_front === 'posts'
								? translate( 'Keep my current theme' )
								: translate( 'No, keep my current theme' ),
						isPrimary: false,
						onClick: this.closeModalHandler( false ),
					},
					{
						action: 'activeTheme',
						label:
							show_on_front === 'posts'
								? translate( 'Activate %(themeName)s', { args: { themeName } } )
								: translate( 'Yes, activate %(themeName)s', { args: { themeName } } ),
						isPrimary: true,
						onClick: this.closeModalHandler( true ),
					},
				] }
				onClose={ this.closeModalHandler( false ) }
			>
				<div>
					<h1>
						{ show_on_front === 'posts'
							? translate( "Activating %(themeName)s can change your existing homepage's content", {
									args: { themeName },
							  } )
							: translate(
									"Activating %(themeName)s will change your existing homepage's content",
									{
										args: { themeName },
									}
							  ) }
					</h1>
					{ show_on_front === 'posts' ? (
						<>
							<h2 className="themes__auto-loading-homepage-modal-options-heading">
								{ translate( 'How would you like to continue?' ) }
							</h2>
							<FormLabel>
								<FormRadio
									value="keep_latest_posts"
									checked={ 'keep_latest_posts' === this.state.homepageAction }
									onChange={ this.handleHomepageAction }
								/>
								<span>{ translate( 'Keep using my latest posts' ) }</span>
							</FormLabel>
							<FormLabel>
								<FormRadio
									value="use_new_homepage"
									checked={ 'use_new_homepage' === this.state.homepageAction }
									onChange={ this.handleHomepageAction }
								/>
								<span>
									{ translate( "Use %(themeName)s's homepage and content", {
										args: { themeName },
									} ) }
								</span>
							</FormLabel>
						</>
					) : (
						<p>
							{ translate(
								'{{strong}}Your existing homepage will be set to draft.{{/strong}} Would you like to continue?',
								{
									components: { strong: <strong /> },
								}
							) }
						</p>
					) }
				</div>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const installingThemeId = getPreActivateThemeId( state );
		const siteOptions = getSiteOptions( state, siteId );

		return {
			siteId,
			siteOptions,
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

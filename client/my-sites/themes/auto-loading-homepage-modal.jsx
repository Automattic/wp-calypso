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
			siteOptions,
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
					<h1 className="themes__auto-loading-homepage-modal-title">
						{ siteOptions.show_on_front === 'posts'
							? translate(
									'Your homepage currently shows the latest posts. {{strong}}%(themeName)s{{/strong}} can replace your homepage layout.',
									{
										args: { themeName },
										components: { strong: <strong /> },
									}
							  )
							: translate(
									'Your already have an existing homepage. {{strong}}%(themeName)s{{/strong}} can replace your homepage layout.',
									{
										args: { themeName },
										components: { strong: <strong /> },
									}
							  ) }
					</h1>
					<h2>{ translate( 'How would you like to continue?' ) }</h2>
					{ siteOptions.show_on_front === 'posts' ? (
						<FormLabel>
							<FormRadio
								value="keep_latest_posts"
								checked={ 'keep_latest_posts' === this.state.homepageAction }
								onChange={ this.handleHomepageAction }
							/>
							<span>With latest post</span>
						</FormLabel>
					) : (
						<FormLabel>
							<FormRadio
								value="keep_existing_homepage"
								checked={ 'keep_existing_homepage' === this.state.homepageAction }
								onChange={ this.handleHomepageAction }
							/>
							<span>Keep existing homepage</span>
						</FormLabel>
					) }
					<FormLabel>
						<FormRadio
							value="use_new_homepage"
							checked={ 'use_new_homepage' === this.state.homepageAction }
							onChange={ this.handleHomepageAction }
						/>
						<span>Use new theme homepage</span>
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

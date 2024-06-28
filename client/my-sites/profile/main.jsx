import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import ColorSchemePicker from 'calypso/blocks/color-scheme-picker';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import ReauthRequired from 'calypso/me/reauth-required';
import { getAdminColor } from 'calypso/state/admin-color/selectors';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';

import './style.scss';

class Profile extends Component {
	getClickHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	}

	getFocusHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	toggleGravatarHidden = ( isHidden ) => {
		this.props.setUserSetting( 'gravatar_profile_hidden', isHidden );
	};

	toggleIsDevAccount = ( isDevAccount ) => {
		this.props.setUserSetting( 'is_dev_account', isDevAccount );
	};

	render() {
		return (
			<Main wideLayout className="profile">
				<PageViewTracker path="/profile" title="My Profile" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'My Profile' ) }
					subtitle={ this.props.translate(
						'Set your name, bio, and other public-facing information. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="manage-profile" showIcon={ false } />
								),
							},
						}
					) }
				/>
				<SectionHeader label={ this.props.translate( 'Color Scheme' ) } />
				<Card>
					<ColorSchemePicker defaultSelection={ this.props.colorSchemePreference } />
				</Card>
			</Main>
		);
	}
}

export default compose(
	connect(
		( state ) => {
			const siteId = getSelectedSiteId( state );
			const calypsoColorScheme = getPreference( state, 'colorScheme' );
			const siteColorScheme = getAdminColor( state, siteId ) ?? calypsoColorScheme;
			const colorScheme = isEnabled( 'layout/site-level-user-profile' )
				? siteColorScheme
				: calypsoColorScheme;

			return {
				isFetchingUserSettings: isFetchingUserSettings( state ),
				colorSchemePreference: colorScheme,
			};
		},
		{ recordGoogleEvent }
	),
	protectForm,
	localize,
	withFormBase
)( Profile );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import ReauthRequired from 'calypso/me/reauth-required';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { getIAmDeveloperCopy } from './get-i-am-a-developer-copy';

import './style.scss';

class Developer extends Component {
	toggleIsDevAccount = ( isDevAccount ) => {
		this.props.setUserSetting( 'is_dev_account', isDevAccount );

		recordTracksEvent( 'calypso_me_is_dev_account_toggled', {
			enabled: isDevAccount ? 1 : 0,
		} );
	};

	render() {
		return (
			<Main className="developer">
				<PageViewTracker path="/me/developer" title="Me > Developer" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'Developer' ) }
					subtitle={ this.props.translate( 'Manage your developer settings' ) }
				/>

				<SectionHeader label={ this.props.translate( 'Developer settings' ) } />
				<Card className="developer__settings">
					<form onChange={ this.props.submitForm }>
						<FormFieldset
							className={ classnames( {
								'developer__is_dev_account-fieldset-is-loading': this.props.isFetchingUserSettings,
							} ) }
						>
							<ToggleControl
								disabled={ this.props.isFetchingUserSettings || this.props.isUpdatingUserSettings }
								checked={ this.props.getSetting( 'is_dev_account' ) }
								onChange={ this.toggleIsDevAccount }
								label={ getIAmDeveloperCopy( this.props.translate ) }
							/>
						</FormFieldset>
					</form>
				</Card>
			</Main>
		);
	}
}

export default compose(
	connect(
		( state ) => ( {
			isFetchingUserSettings: isFetchingUserSettings( state ),
		} ),
		{ recordGoogleEvent }
	),
	localize,
	withFormBase
)( Developer );

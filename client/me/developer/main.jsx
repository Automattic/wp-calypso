import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import ReauthRequired from 'calypso/me/reauth-required';
import { removeNotice } from 'calypso/state/notices/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { DeveloperFeatures } from './features/index';
import { getIAmDeveloperCopy } from './get-i-am-a-developer-copy';

import './style.scss';

class Developer extends Component {
	handleToggleIsDevAccount = ( isDeveloperAccount ) => {
		this.props.setUserSetting( 'is_dev_account', isDeveloperAccount );

		recordTracksEvent( 'calypso_me_is_dev_account_toggled', {
			enabled: isDeveloperAccount ? 1 : 0,
		} );

		setTimeout( () => this.props.removeNotice( 'save-user-settings' ), 3000 );
	};

	render() {
		return (
			<Main className="developer" wideLayout>
				<PageViewTracker path="/me/developer" title="Me > Developer" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'Developer Features' ) }
					subtitle={ this.props.translate(
						'Take WordPress.com further with early access to new developer features.'
					) }
					className="developer__header"
				/>

				<div className="developer-is-dev-account">
					<Card
						className={ clsx( 'developer__is-dev-account-card', {
							'is-loading': this.props.isFetchingUserSettings,
						} ) }
					>
						<form onChange={ this.props.submitForm }>
							<FormFieldset>
								<ToggleControl
									disabled={
										this.props.isFetchingUserSettings || this.props.isUpdatingUserSettings
									}
									checked={ this.props.getSetting( 'is_dev_account' ) }
									onChange={ this.handleToggleIsDevAccount }
									label={ getIAmDeveloperCopy( this.props.translate ) }
									__nextHasNoMarginBottom
								/>
							</FormFieldset>
						</form>
					</Card>
				</div>

				<DeveloperFeatures />
			</Main>
		);
	}
}

export default compose(
	connect(
		( state ) => ( {
			isFetchingUserSettings: isFetchingUserSettings( state ),
		} ),
		{
			removeNotice,
		}
	),
	localize,
	withFormBase
)( Developer );

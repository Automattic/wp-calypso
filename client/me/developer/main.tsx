import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ToggleControl } from '@wordpress/components';
import classnames from 'classnames';
import { localize, I18N } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import ReauthRequired from 'calypso/me/reauth-required';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { getIAmDeveloperCopy } from './get-i-am-a-developer-copy';
import type { AppState } from 'calypso/types';

import './style.scss';

type DeveloperProps = {
	translate: I18N[ 'translate' ];
	isFetchingUserSettings: boolean;
	isUpdatingUserSettings: boolean;
	setUserSetting: ( settingName: string, value: boolean ) => void;
	getSetting: ( settingName: string ) => boolean;
	submitForm: () => void;
};

const Developer = ( {
	translate,
	isFetchingUserSettings,
	setUserSetting,
	submitForm,
	isUpdatingUserSettings,
	getSetting,
}: DeveloperProps ) => {
	const handleToggleIsDevAccount = ( isDevAccount: boolean ) => {
		setUserSetting( 'is_dev_account', isDevAccount );

		recordTracksEvent( 'calypso_me_is_dev_account_toggled', {
			enabled: isDevAccount ? 1 : 0,
		} );
	};

	return (
		<Main className="developer">
			<PageViewTracker path="/me/developer" title="Me > Developer" />
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'WordPress.com Developer Program' ) }
				subtitle={ translate( 'Elevate your development journey with WordPress.com. Coming soon!', {
					components: {
						learnMoreLink: <InlineSupportLink supportContext="manage-profile" showIcon={ false } />,
					},
				} ) }
			/>

			<form onChange={ submitForm }>
				<FormFieldset
					className={ classnames( {
						'developer__is_dev_account-fieldset-is-loading': isFetchingUserSettings,
					} ) }
				>
					<ToggleControl
						disabled={ isUpdatingUserSettings }
						checked={ getSetting( 'is_dev_account' ) }
						onChange={ handleToggleIsDevAccount }
						label={ getIAmDeveloperCopy( translate ) }
					/>
				</FormFieldset>
			</form>
		</Main>
	);
};

export const DeveloperComponent = compose(
	connect(
		( state: AppState ) => ( {
			isFetchingUserSettings: isFetchingUserSettings( state ),
		} ),
		{ recordGoogleEvent }
	),
	protectForm,
	localize,
	withFormBase
)( Developer );

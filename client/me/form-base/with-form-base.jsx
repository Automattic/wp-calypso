/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';
import hasUnsavedUserSettings from 'calypso/state/selectors/has-unsaved-user-settings';
import {
	setUserSetting,
	clearUnsavedUserSettings,
	saveUserSettings,
} from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';

const withFormBase = ( WrappedComponent ) => {
	class EnhancedComponent extends React.Component {
		static displayName = `withFormBase(${ WrappedComponent.displayName || WrappedComponent.name })`;

		state = {
			redirect: false,
		};

		componentWillUnmount() {
			// Silently clean up unsavedSettings before unmounting
			this.props.clearUnsavedUserSettings();
		}

		getDisabledState = () => {
			return this.props.isUpdatingUserSettings;
		};

		getSetting = ( settingName ) => {
			const { _unsavedUserSettings, _userSettings } = this.props;
			return _unsavedUserSettings[ settingName ] ?? _userSettings[ settingName ] ?? '';
		};

		toggleSetting = ( event ) => {
			const { name } = event.currentTarget;
			this.props.setUserSetting( name, ! this.props._userSettings[ name ] );
		};

		updateSetting = ( event ) => {
			const { name, value } = event.currentTarget;
			this.props.setUserSetting( name, value );
		};

		submitForm = ( event ) => {
			event.preventDefault();

			this.props.saveUserSettings( null, () => this.props.markSaved?.() );
		};

		getFormBaseProps = () => ( {
			getDisabledState: this.getDisabledState,
			getSetting: this.getSetting,
			toggleSetting: this.toggleSetting,
			updateSetting: this.updateSetting,
			submitForm: this.submitForm,
			hasUnsavedUserSettings: this.props.hasUnsavedUserSettings,
		} );

		render() {
			return (
				<>
					<QueryUserSettings />
					<WrappedComponent { ...this.props } { ...this.getFormBaseProps() } />
				</>
			);
		}
	}

	return connect(
		( state ) => ( {
			_userSettings: getUserSettings( state ),
			_unsavedUserSettings: getUnsavedUserSettings( state ),
			hasUnsavedUserSettings: hasUnsavedUserSettings( state ),
			isUpdatingUserSettings: isUpdatingUserSettings( state ),
		} ),
		{ errorNotice, successNotice, setUserSetting, clearUnsavedUserSettings, saveUserSettings }
	)( localize( EnhancedComponent ) );
};

export default withFormBase;

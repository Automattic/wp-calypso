/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';
import hasUnsavedUserSettings from 'calypso/state/selectors/has-unsaved-user-settings';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import {
	clearUnsavedUserSettings,
	setUserSetting,
	saveUserSettings,
} from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const withFormBase = ( WrappedComponent ) => {
	class EnhancedComponent extends React.Component {
		static displayName = `withFormBase(${ WrappedComponent.displayName || WrappedComponent.name })`;

		componentDidUpdate( prevProps ) {
			if ( prevProps.hasUnsavedUserSettings && ! this.props.hasUnsavedUserSettings ) {
				this.props.markSaved?.();
			}
		}

		componentWillUnmount() {
			// Silently clean up unsavedSettings before unmounting
			this.props.clearUnsavedUserSettings();
		}

		getDisabledState = () => {
			return this.props.isUpdatingUserSettings;
		};

		getSetting = ( settingName ) => {
			const { unsavedUserSettings, userSettings } = this.props;
			return unsavedUserSettings[ settingName ] ?? userSettings[ settingName ] ?? '';
		};

		toggleSetting = ( event ) => {
			const { name } = event.currentTarget;
			this.props.setUserSetting( name, ! this.getSetting( name ) );
		};

		updateSetting = ( event ) => {
			const { name, value } = event.currentTarget;
			this.props.setUserSetting( name, value );
		};

		submitForm = ( event ) => {
			event.preventDefault();

			this.props.saveUserSettings();
		};

		getFormBaseProps = () => ( {
			getDisabledState: this.getDisabledState,
			getSetting: this.getSetting,
			toggleSetting: this.toggleSetting,
			updateSetting: this.updateSetting,
			submitForm: this.submitForm,
			hasUnsavedUserSettings: this.props.hasUnsavedUserSettings,
			isUpdatingUserSettings: this.props.isUpdatingUserSettings,
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
			userSettings: getUserSettings( state ),
			unsavedUserSettings: getUnsavedUserSettings( state ),
			hasUnsavedUserSettings: hasUnsavedUserSettings( state ),
			isUpdatingUserSettings: isUpdatingUserSettings( state ),
		} ),
		{
			clearUnsavedUserSettings,
			errorNotice,
			saveUserSettings,
			setUserSetting,
			successNotice,
		}
	)( localize( EnhancedComponent ) );
};

export default withFormBase;

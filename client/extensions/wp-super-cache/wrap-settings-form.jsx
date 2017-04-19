/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import {
	flowRight,
	isEqual,
	keys,
	omit,
	pick,
} from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { protectForm } from 'lib/protect-form';
import trackForm from 'lib/track-form';
import QuerySettings from './query-settings';
import {
	errorNotice,
	removeNotice,
	successNotice,
} from 'state/notices/actions';
import { saveSettings } from './state/settings/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSettings,
	isRequestingSettings,
	isSavingSettings,
	isSettingsSaveSuccessful,
} from './state/settings/selectors';

const wrapSettingsForm = getFormSettings => SettingsForm => {
	class WrappedSettingsForm extends Component {
		componentWillMount() {
			if ( getFormSettings ) {
				this.props.replaceFields( getFormSettings( this.props.settings ) );
			}
		}

		componentDidUpdate( prevProps ) {
			if ( prevProps.siteId !== this.props.siteId ) {
				const newSiteFields = getFormSettings( this.props.settings );

				this.props.clearDirtyFields();
				this.props.replaceFields( newSiteFields );
			} else if (
				! isEqual( prevProps.settings, this.props.settings ) ||
				! isEqual( prevProps.fields, this.props.fields )
			) {
				this.updateDirtyFields();
			}

			if ( ! this.props.isSaving && prevProps.isSaving ) {
				if ( this.props.isSaveSuccessful ) {
					this.props.successNotice(
						this.props.translate( 'Settings saved!' ),
						{ id: 'wpsc-settings-save' }
					);
				} else {
					this.props.errorNotice(
						this.props.translate( 'There was a problem saving your changes. Please try again.' ),
						{ id: 'wpsc-settings-save' }
					);
				}
			}
		}

		updateDirtyFields() {
			const currentFields = this.props.fields;
			const persistedFields = getFormSettings( this.props.settings );

			// Compute the dirty fields by comparing the persisted and the current fields
			const previousDirtyFields = this.props.dirtyFields;
			/*eslint-disable eqeqeq*/
			const nextDirtyFields = previousDirtyFields.filter( field => ! ( currentFields[ field ] == persistedFields[ field ] ) );
			/*eslint-enable eqeqeq*/

			// Update the dirty fields state without updating their values
			if ( 0 === nextDirtyFields.length ) {
				this.props.markSaved();
			} else {
				this.props.markChanged();
			}

			this.props.clearDirtyFields();
			this.props.updateFields( pick( currentFields, nextDirtyFields ) );

			// Set the new non dirty fields
			const nextNonDirtyFields = omit( persistedFields, nextDirtyFields );
			this.props.replaceFields( nextNonDirtyFields );
		}

		handleChange = field => event => {
			this.props.updateFields( { [ field ]: event.target.value } );
		};

		handleRadio = event => {
			const name = event.currentTarget.name;
			const value = event.currentTarget.value;

			this.props.updateFields( { [ name ]: value } );
		};

		handleSelect = event => {
			const { name, value } = event.currentTarget;
			// Attempt to cast numeric fields value to int.
			const parsedValue = parseInt( value, 10 );

			this.props.updateFields( { [ name ]: isNaN( parsedValue ) ? value : parsedValue } );
		};

		handleAutosavingToggle = name => () => {
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] }, () => {
				this.submitForm();
			} );
		};

		handleToggle = name => () => {
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		// Update a field that is stored as an array element.
		setFieldArrayValue = ( name, index ) => event => {
			const currentValue = this.props.fields[ name ];
			const newValue = [
				...currentValue.slice( 0, index ),
				event.target.value,
				...currentValue.slice( index + 1 ),
			];

			this.props.updateFields( {
				[ name ]: newValue,
			} );
		};

		handleSubmitForm = event => {
			event.preventDefault();
			this.submitForm();
		};

		submitForm = () => {
			const {
				fields,
				settingsFields,
				siteId,
			} = this.props;

			this.props.removeNotice( 'wpsc-settings-save' );
			this.props.saveSettings( siteId, pick( fields, settingsFields ) );
		};

		render() {
			const utils = {
				handleAutosavingToggle: this.handleAutosavingToggle,
				handleChange: this.handleChange,
				handleRadio: this.handleRadio,
				handleSelect: this.handleSelect,
				handleSubmitForm: this.handleSubmitForm,
				handleToggle: this.handleToggle,
				setFieldArrayValue: this.setFieldArrayValue,
			};

			return (
				<div>
					<QuerySettings siteId={ this.props.siteId } />
					<SettingsForm { ...this.props } { ...utils } />
				</div>
			);
		}
	}

	const connectComponent = connect(
		state => {
			const siteId = getSelectedSiteId( state );
			const isSaving = isSavingSettings( state, siteId );
			const isSaveSuccessful = isSettingsSaveSuccessful( state, siteId );
			const settings = Object.assign( {}, getSettings( state, siteId ), {
				// Miscellaneous
				cache_compression_disabled: false,

				// Accepted Filenames & Rejected URIs
				accepted_files: 'wp-comments-popup.php',
				rejected_uri: 'wp-.*\.php',

				// Rejected User Agents
				rejected_user_agent: 'bot\nia_archive\nslurp\ncrawl\nspider\nYandex',

				// Lock Down
				lock_down: false,

				// Directly Cached Files
				cache_direct_pages: [
					'/about/',
					'/home/',
				],
				cache_readonly: false,
				cache_writable: false,
			} );
			const isRequesting = isRequestingSettings( state, siteId ) && ! settings;
			// Don't include read-only fields when saving.
			const settingsFields = keys( omit( settings, [
				'cache_compression_disabled',
				'cache_direct_pages',
				'cache_disable_locking',
				'cache_mobile_browsers',
				'cache_mobile_prefixes',
				'cache_mod_rewrite',
				'cache_next_gc',
				'cache_readonly',
				'cache_writable',
				'generated',
				'is_preload_enabled',
				'is_preloading',
				'minimum_preload_interval',
				'post_count',
				'preload_refresh',
				'supercache',
				'wpcache',
			] ) );

			return {
				isRequesting,
				isSaveSuccessful,
				isSaving,
				settings,
				settingsFields,
				siteId,
			};
		},
		dispatch => {
			const boundActionCreators = bindActionCreators( {
				errorNotice,
				removeNotice,
				saveSettings,
				successNotice,
			}, dispatch );

			return {
				...boundActionCreators,
			};
		}
	);

	return flowRight(
		connectComponent,
		localize,
		trackForm,
		protectForm,
	)( WrappedSettingsForm );
};

export default wrapSettingsForm;

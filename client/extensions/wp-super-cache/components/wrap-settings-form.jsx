/**
 * External dependencies
 */

import React, { Component } from 'react';
import { flowRight, isEqual, omit, pick } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { protectForm } from 'lib/protect-form';
import trackForm from 'lib/track-form';
import QuerySettings from './data/query-settings';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { deleteCache } from '../state/cache/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { saveSettings } from '../state/settings/actions';
import { isCacheDeleteSuccessful, isDeletingCache } from '../state/cache/selectors';
import {
	getSettings,
	isRequestingSettings,
	isSavingSettings,
	isSettingsSaveSuccessful,
} from '../state/settings/selectors';

const wrapSettingsForm = ( getFormSettings ) => ( SettingsForm ) => {
	class WrappedSettingsForm extends Component {
		UNSAFE_componentWillMount() {
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
					this.props.successNotice( this.props.translate( 'Settings saved!' ), {
						id: 'wpsc-settings-save',
					} );
				} else {
					this.props.errorNotice(
						this.props.translate( 'There was a problem saving your changes. Please try again.' ),
						{ id: 'wpsc-settings-save' }
					);
				}
			}

			this.showCacheDeleteNotice( prevProps );
		}

		updateDirtyFields() {
			const currentFields = this.props.fields;
			const persistedFields = getFormSettings( this.props.settings );

			// Compute the dirty fields by comparing the persisted and the current fields
			const previousDirtyFields = this.props.dirtyFields;
			const nextDirtyFields = previousDirtyFields.filter(
				( field ) => ! isEqual( currentFields[ field ], persistedFields[ field ] )
			);

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

		showCacheDeleteNotice = ( prevProps ) => {
			if ( this.props.isDeleting || ! prevProps.isDeleting ) {
				return;
			}

			const { isDeleteSuccessful, site, translate } = this.props;

			this.props.removeNotice( 'wpsc-settings-save' );

			if ( isDeleteSuccessful ) {
				this.props.successNotice(
					translate( 'Cache successfully deleted on %(site)s.', {
						args: { site: site && site.title },
					} ),
					{ id: 'wpsc-cache-delete' }
				);
			} else {
				this.props.errorNotice(
					translate( 'There was a problem deleting the cache. Please try again.' ),
					{ id: 'wpsc-cache-delete' }
				);
			}
		};

		handleChange = ( field ) => ( event ) => {
			this.props.updateFields( { [ field ]: event.target.value } );
		};

		handleRadio = ( event ) => {
			const name = event.currentTarget.name;
			const value = event.currentTarget.value;

			this.props.updateFields( { [ name ]: value } );
		};

		handleSelect = ( event ) => {
			const { name, value } = event.currentTarget;
			// Attempt to cast numeric fields value to int.
			const parsedValue = parseInt( value, 10 );

			this.props.updateFields( { [ name ]: isNaN( parsedValue ) ? value : parsedValue } );
		};

		handleAutosavingToggle = ( name ) => () => {
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] }, () => {
				this.submitForm();
			} );
		};

		handleToggle = ( name ) => () => {
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		setFieldValue = ( field, value, autosave = false ) => {
			this.props.updateFields( { [ field ]: value }, () => {
				autosave && this.submitForm();
			} );
		};

		// Delete an element from an array field.
		deleteFieldArrayValue = ( name, index ) => () => {
			const currentValue = this.props.fields[ name ];
			const newValue = [ ...currentValue.slice( 0, index ), ...currentValue.slice( index + 1 ) ];

			this.props.updateFields(
				{
					[ name ]: newValue,
				},
				() => {
					this.submitForm();
				}
			);
		};

		handleSubmitForm = ( event ) => {
			event.preventDefault();
			this.submitForm();
		};

		submitForm = () => {
			const { fields, siteId } = this.props;

			this.props.removeNotice( 'wpsc-cache-delete' );
			this.props.removeNotice( 'wpsc-settings-save' );
			this.props.saveSettings( siteId, fields );
		};

		handleDeleteCache = ( deleteAll, deleteExpired ) => {
			this.props.removeNotice( 'wpsc-cache-delete' );
			this.props.deleteCache( this.props.siteId, deleteAll, deleteExpired );
		};

		render() {
			const utils = {
				deleteFieldArrayValue: this.deleteFieldArrayValue,
				handleAutosavingToggle: this.handleAutosavingToggle,
				handleChange: this.handleChange,
				handleDeleteCache: this.handleDeleteCache,
				handleRadio: this.handleRadio,
				handleSelect: this.handleSelect,
				handleSubmitForm: this.handleSubmitForm,
				handleToggle: this.handleToggle,
				setFieldValue: this.setFieldValue,
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
		( state ) => {
			const site = getSelectedSite( state ) || {};
			const siteId = getSelectedSiteId( state );
			const isSaving = isSavingSettings( state, siteId );
			const isSaveSuccessful = isSettingsSaveSuccessful( state, siteId );
			const settings = getSettings( state, siteId );
			const isRequesting = isRequestingSettings( state, siteId ) && ! settings;
			const isDeleting = isDeletingCache( state, siteId );
			const isDeleteSuccessful = isCacheDeleteSuccessful( state, siteId );

			return {
				isDeleteSuccessful,
				isDeleting,
				isRequesting,
				isSaveSuccessful,
				isSaving,
				settings,
				site,
				siteId,
			};
		},
		{
			deleteCache,
			errorNotice,
			removeNotice,
			saveSettings,
			successNotice,
		}
	);

	return flowRight( connectComponent, localize, trackForm, protectForm )( WrappedSettingsForm );
};

export default wrapSettingsForm;

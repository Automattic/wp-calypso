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
import QueryNotices from './data/query-notices';
import QuerySettings from './data/query-settings';
import {
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';
import {
	deleteCache,
	testCache,
} from './state/cache/actions';
import {
	errorNotice,
	removeNotice,
	successNotice,
} from 'state/notices/actions';
import { saveSettings } from './state/settings/actions';
import {
	getCacheTestResults,
	isCacheDeleteSuccessful,
	isCacheTestSuccessful,
	isDeletingCache,
	isTestingCache,
} from './state/cache/selectors';
import { getNotices } from './state/notices/selectors';
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

			this.showCacheDeleteNotice( prevProps );
			this.showCacheTestNotice( prevProps );
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

		showCacheDeleteNotice = ( prevProps ) => {
			if ( this.props.isDeleting || ! prevProps.isDeleting ) {
				return;
			}

			const {
				isDeleteSuccessful,
				site,
				translate,
			} = this.props;

			this.props.removeNotice( 'wpsc-settings-save' );

			if ( isDeleteSuccessful ) {
				this.props.successNotice(
					translate( 'Cache successfully deleted on %(site)s.', { args: { site: site && site.title } } ),
					{ id: 'wpsc-cache-delete' }
				);
			} else {
				this.props.errorNotice(
					translate( 'There was a problem deleting the cache. Please try again.' ),
					{ id: 'wpsc-cache-delete' }
				);
			}
		};

		showCacheTestNotice = ( prevProps ) => {
			if ( this.props.isTesting || ! prevProps.isTesting ) {
				return;
			}

			const {
				isTestSuccessful,
				site,
				translate,
			} = this.props;

			this.props.removeNotice( 'wpsc-settings-save' );

			if ( isTestSuccessful ) {
				this.props.successNotice(
					translate( 'Cache test completed successfully on %(site)s.', { args: { site: site && site.title } } ),
					{ id: 'wpsc-cache-test' }
				);
			} else {
				this.props.errorNotice(
					translate( 'There was a problem testing the cache. Please try again.' ),
					{ id: 'wpsc-cache-test' }
				);
			}
		};

		removeCacheNotices = () => {
			this.props.removeNotice( 'wpsc-cache-delete' );
			this.props.removeNotice( 'wpsc-cache-test' );
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

		setFieldValue = ( field, value ) => this.props.updateFields( { [ field ]: value } );

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

			this.removeCacheNotices();
			this.props.removeNotice( 'wpsc-settings-save' );
			this.props.saveSettings( siteId, pick( fields, settingsFields ) );
		};

		handleDeleteCache = ( deleteAll, deleteExpired ) => {
			this.removeCacheNotices();
			this.props.deleteCache( this.props.siteId, deleteAll, deleteExpired );
		}

		handleTestCache = httpOnly => {
			this.removeCacheNotices();
			this.props.testCache( this.props.siteId, httpOnly );
		}

		render() {
			const utils = {
				handleAutosavingToggle: this.handleAutosavingToggle,
				handleChange: this.handleChange,
				handleDeleteCache: this.handleDeleteCache,
				handleRadio: this.handleRadio,
				handleSelect: this.handleSelect,
				handleSubmitForm: this.handleSubmitForm,
				handleTestCache: this.handleTestCache,
				handleToggle: this.handleToggle,
				setFieldValue: this.setFieldValue,
				setFieldArrayValue: this.setFieldArrayValue,
			};

			return (
				<div>
					<QueryNotices siteId={ this.props.siteId } />
					<QuerySettings siteId={ this.props.siteId } />
					<SettingsForm { ...this.props } { ...utils } />
				</div>
			);
		}
	}

	const connectComponent = connect(
		state => {
			const site = getSelectedSite( state ) || {};
			const siteId = getSelectedSiteId( state );
			const isSaving = isSavingSettings( state, siteId );
			const isSaveSuccessful = isSettingsSaveSuccessful( state, siteId );
			const notices = getNotices( state, siteId );
			const settings = getSettings( state, siteId );
			const isRequesting = isRequestingSettings( state, siteId ) && ! settings;
			// Don't include read-only fields when saving.
			const settingsFields = keys( omit( settings, [
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
			const isDeleting = isDeletingCache( state, siteId );
			const isDeleteSuccessful = isCacheDeleteSuccessful( state, siteId );
			const isTesting = isTestingCache( state, siteId );
			const isTestSuccessful = isCacheTestSuccessful( state, siteId );
			const cacheTestResults = getCacheTestResults( state, siteId );

			return {
				cacheTestResults,
				isDeleteSuccessful,
				isDeleting,
				isRequesting,
				isSaveSuccessful,
				isSaving,
				isTesting,
				isTestSuccessful,
				notices,
				settings,
				settingsFields,
				site,
				siteId,
			};
		},
		dispatch => {
			const boundActionCreators = bindActionCreators( {
				deleteCache,
				errorNotice,
				removeNotice,
				saveSettings,
				successNotice,
				testCache,
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

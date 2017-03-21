/**
 * External dependencies
 */
import React, { Component } from 'react';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import trackForm from 'lib/track-form';

const wrapSettingsForm = getFormSettings => SettingsForm => {
	class WrappedSettingsForm extends Component {
		componentWillMount() {
			this.props.replaceFields( getFormSettings( this.props.settings ) );
		}

		handleRadio = event => {
			const name = event.currentTarget.name;
			const value = event.currentTarget.value;

			this.props.updateFields( { [ name ]: value } );
		};

		handleToggle = name => () => {
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		render() {
			const utils = {
				handleRadio: this.handleRadio,
				handleToggle: this.handleToggle,
			};

			return <SettingsForm { ...this.props } { ...utils } />;
		}
	}

	const connectComponent = connect(
		() => {
			// TODO: Replace with REST API once ready.
			const settings = {
				wp_cache_status: false,
				super_cache_enabled: '0',
				cache_compression: false,
				cache_rebuild_files: true,
				wp_cache_hello_world: false,
				wp_cache_make_known_anon: false,
				wp_cache_no_cache_for_get: false,
				wp_cache_not_logged_in: false,
				wp_supercache_304: false,
				cache_page_secret: 'af1a001901367ede34cb22ffadb9a565',
				wp_cache_clear_on_post_edit: false,
				wp_cache_disable_utf8: false,
				wp_cache_front_page_checks: true,
				wp_cache_mfunc_enabled: false,
				wp_cache_mobile_enabled: false,
				wp_cache_mutex_disabled: false,
				wp_cache_refresh_single_only: false,
				wp_super_cache_late_init: false,
				wp_supercache_cache_list: false,
			};

			return {
				settings,
			};
		}
	);

	return flowRight(
		connectComponent,
		localize,
		trackForm,
	)( WrappedSettingsForm );
};

export default wrapSettingsForm;

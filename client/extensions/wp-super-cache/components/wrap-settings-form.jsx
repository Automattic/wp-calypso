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

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

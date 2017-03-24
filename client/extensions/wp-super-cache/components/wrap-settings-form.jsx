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
			if ( getFormSettings ) {
				this.props.replaceFields( getFormSettings( this.props.settings ) );
			}
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

		handleToggle = name => () => {
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		render() {
			const utils = {
				handleChange: this.handleChange,
				handleRadio: this.handleRadio,
				handleSelect: this.handleSelect,
				handleToggle: this.handleToggle,
			};

			return <SettingsForm { ...this.props } { ...utils } />;
		}
	}

	const connectComponent = connect(
		() => {
			// TODO: Replace with REST API once ready.
			const settings = {
				wp_cache_enabled: true,
				super_cache_enabled: '1',
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
				wp_cache_mobile_enabled: true,
				wp_cache_mutex_disabled: false,
				_wp_using_ext_object_cache: true,
				wp_cache_object_cache: false,
				wp_cache_refresh_single_only: false,
				wp_super_cache_late_init: false,
				wp_supercache_cache_list: false,
				wp_cache_location: '/wordpress/wp-content/cache/',
				cache_gc_email_me: false,
				cache_max_time: '3600',
				cache_schedule_interval: 'five_minutes_interval',
				cache_schedule_type: 'interval',
				cache_scheduled_time: '00:00',
				cache_time_interval: '60',
				wp_cache_pages: {
					search: false,
					feed: false,
					category: false,
					home: false,
					frontpage: false,
					tag: false,
					archives: false,
					pages: false,
					single: false,
					author: false,
				},
				wp_rejected_uri: 'wp-.*\.php',
				wp_accepted_files: 'wp-comments-popup.php',
				wp_rejected_user_agent: 'bot\nia_archive\nslurp\ncrawl\nspider\nYandex',
				wp_lock_down: false,
				wp_cache_mobile_browsers: 'w3c , w3c-, acs-, alav, alca, amoi, audi, avan, benq, bird, blac, ' +
					'blaz, brew, cell, cldc, cmd-, dang, doco, eric, hipt, htc_, inno, ipaq, ipod, jigs, kddi, ' +
					'keji, leno, lg-c, lg-d, lg-g, lge-, lg/u, maui, maxo, midp, mits, mmef, mobi, mot-, moto, ' +
					'mwbp, nec-, newt, noki, palm, pana, pant, phil, play, port, prox, qwap, sage, sams, sany, ' +
					'sch-, sec-, send, seri, sgh-, shar, sie-, siem, smal, smar, sony, sph-, symb, t-mo, teli, ' +
					'tim-, tosh, tsm-, upg1, upsi, vk-v, voda, wap-, wapa, wapi, wapp, wapr, webc, winw, winw, xda , xda-',
				wp_cache_mobile_prefixes: 'w3c , w3c-, acs-, alav, alca, amoi, audi, avan, benq, bird, blac, ' +
					'blaz, brew, cell, cldc, cmd-, dang, doco, eric, hipt, htc_, inno, ipaq, ipod, jigs, kddi, ' +
					'keji, leno, lg-c, lg-d, lg-g, lge-, lg/u, maui, maxo, midp, mits, mmef, mobi, mot-, moto, ' +
					'mwbp, nec-, newt, noki, palm, pana, pant, phil, play, port, prox, qwap, sage, sams, sany, ' +
					'sch-, sec-, send, seri, sgh-, shar, sie-, siem, smal, smar, sony, sph-, symb, t-mo, teli, ' +
					'tim-, tosh, tsm-, upg1, upsi, vk-v, voda, wap-, wapa, wapi, wapp, wapr, webc, winw, winw, xda , xda-',
				wp_cache_readonly: false,
				wp_cache_writable: false,
				wp_cache_path: '/wordpress/',
				wp_cache_direct_pages: [
					'/about/',
					'/home/',
				],
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

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
import QuerySettings from './query-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSettings,
	isRequestingSettings,
} from './state/selectors';

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
			const settings = Object.assign( {}, getSettings( state, siteId ), {
				// Caching
				wp_cache_enabled: true,

				// Miscellaneous
				cache_compression: false,
				cache_rebuild_files: true,
				wp_cache_compression_disabled: false,
				wp_cache_hello_world: false,
				wp_cache_make_known_anon: false,
				wp_cache_no_cache_for_get: false,
				wp_cache_not_logged_in: false,
				wp_supercache_304: false,

				// Advanced
				_wp_using_ext_object_cache: true,
				cache_page_secret: 'af1a001901367ede34cb22ffadb9a565',
				super_cache_enabled: '1',	// Also used by Caching & Miscellaneous
				wp_cache_clear_on_post_edit: false,
				wp_cache_disable_locking: false,
				wp_cache_disable_utf8: false,
				wp_cache_front_page_checks: true,
				wp_cache_mfunc_enabled: false,
				wp_cache_mobile_browsers: 'w3c , w3c-, acs-, alav, alca, amoi, audi, avan, benq, bird, blac, ' +
					'blaz, brew, cell, cldc, cmd-, dang, doco, eric, hipt, htc_, inno, ipaq, ipod, jigs, kddi, ' +
					'keji, leno, lg-c, lg-d, lg-g, lge-, lg/u, maui, maxo, midp, mits, mmef, mobi, mot-, moto, ' +
					'mwbp, nec-, newt, noki, palm, pana, pant, phil, play, port, prox, qwap, sage, sams, sany, ' +
					'sch-, sec-, send, seri, sgh-, shar, sie-, siem, smal, smar, sony, sph-, symb, t-mo, teli, ' +
					'tim-, tosh, tsm-, upg1, upsi, vk-v, voda, wap-, wapa, wapi, wapp, wapr, webc, winw, winw, xda , xda-',
				wp_cache_mobile_enabled: true,
				wp_cache_mobile_prefixes: 'w3c , w3c-, acs-, alav, alca, amoi, audi, avan, benq, bird, blac, ' +
					'blaz, brew, cell, cldc, cmd-, dang, doco, eric, hipt, htc_, inno, ipaq, ipod, jigs, kddi, ' +
					'keji, leno, lg-c, lg-d, lg-g, lge-, lg/u, maui, maxo, midp, mits, mmef, mobi, mot-, moto, ' +
					'mwbp, nec-, newt, noki, palm, pana, pant, phil, play, port, prox, qwap, sage, sams, sany, ' +
					'sch-, sec-, send, seri, sgh-, shar, sie-, siem, smal, smar, sony, sph-, symb, t-mo, teli, ' +
					'tim-, tosh, tsm-, upg1, upsi, vk-v, voda, wap-, wapa, wapi, wapp, wapr, webc, winw, winw, xda , xda-',
				wp_cache_mod_rewrite: false,
				wp_cache_mutex_disabled: false,
				wp_cache_object_cache: false,
				wp_cache_refresh_single_only: false,
				wp_super_cache_late_init: false,
				wp_supercache_cache_list: false,

				// Cache Location
				wp_cache_location: '/wordpress/wp-content/cache/',

				// Expiry Time & Garbage Collection
				cache_gc_email_me: false,
				cache_max_time: 3600,
				cache_schedule_interval: 'five_minutes_interval',
				cache_schedule_type: 'interval',
				cache_scheduled_time: '00:00',
				cache_time_interval: '60',
				wp_cache_next_gc: '2017-03-23 17:45:16 UTC',
				wp_cache_preload_on: true,

				// Accepted Filenames & Rejected URIs
				wp_accepted_files: 'wp-comments-popup.php',
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

				// Rejected User Agents
				wp_rejected_user_agent: 'bot\nia_archive\nslurp\ncrawl\nspider\nYandex',

				// Lock Down
				wp_lock_down: false,

				// Directly Cached Files
				wp_cache_direct_pages: [
					'/about/',
					'/home/',
				],
				wp_cache_path: '/wordpress/',
				wp_cache_readonly: false,
				wp_cache_writable: false,

				// CDN
				ossdl_cname: '',
				ossdl_https: false,
				ossdl_off_cdn_url: 'http://donnapep.wpsandbox.me',
				ossdl_off_exclude: '.php',
				ossdl_off_include_dirs: 'wp-content,wp-includes',
				ossdlcdn: false,

				// Contents
				cache_stats: {
					generated: 60,
					supercache: {
						cached_list: [
							{
								age: 3029,
								uri: 'localhost/blogs/',
							},
							{
								age: 3031,
								uri: 'localhost/professionals/',
							},
							{
								age: 3322,
								uri: 'localhost/',
							},
						],
						expired_list: [
							{
								age: 4975,
								uri: 'localhost/support/',
							},
							{
								age: 4973,
								uri: 'localhost/get-involved/',
							},
						],
						fsize: '69.78KB',
					},
					wpcache: {
						cached_list: [
							{
								age: 95,
								uri: 'localhost/support-info/',
							},
							{
								age: 3031,
								uri: 'localhost/about/',
							},
						],
						expired_list: [
							{
								age: 81,
								uri: 'localhost/blogs/',
							},
						],
						fsize: '32.18KB',
					},
				},

				// Preload
				is_preload_enabled: true,
				is_preloading: false,
				minimum_preload_interval: 30,
				preload_email_volume: 'none',
				preload_interval: 30,
				preload_on: false,
				preload_posts: 'all',
				preload_posts_options: [ 'all', '161', '322' ],
				preload_refresh: true,
				preload_taxonomies: false,
			} );
			const isRequesting = isRequestingSettings( state, siteId ) && ! settings;

			return {
				isRequesting,
				settings,
				siteId,
			};
		},
	);

	return flowRight(
		connectComponent,
		localize,
		trackForm,
		protectForm,
	)( WrappedSettingsForm );
};

export default wrapSettingsForm;

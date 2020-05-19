/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { flowRight, get, isEmpty, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isHttps } from 'lib/url';
import { Button, Card } from '@automattic/components';
import Notice from 'components/notice';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle/compact';
import QueryStatus from '../data/query-status';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';
import { testCache } from '../../state/cache/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteTitle } from 'state/sites/selectors';
import { getCacheTestResults, isTestingCache } from '../../state/cache/selectors';
import { getStatus } from '../../state/status/selectors';

class EasyTab extends Component {
	static propTypes = {
		cacheTestResults: PropTypes.object,
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		handleDeleteCache: PropTypes.func.isRequired,
		isDeleting: PropTypes.bool,
		isReadOnly: PropTypes.bool.isRequired,
		isRequesting: PropTypes.bool,
		isSaving: PropTypes.bool,
		isTesting: PropTypes.bool,
		site: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		siteTitle: PropTypes.string,
		testCache: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
	};

	state = {
		httpOnly: true,
		isDeleting: false,
		isDeletingAll: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isDeleting && ! nextProps.isDeleting ) {
			this.setState( {
				isDeleting: false,
				isDeletingAll: false,
			} );
		}
	}

	handleHttpOnlyChange = () => this.setState( { httpOnly: ! this.state.httpOnly } );

	deleteCache = () => {
		this.setState( { isDeleting: true } );
		this.props.handleDeleteCache( false, false );
	};

	deleteAllCaches = () => {
		this.setState( { isDeletingAll: true } );
		this.props.handleDeleteCache( true, false );
	};

	testCache = () => {
		this.props.testCache( this.props.siteId, this.props.siteTitle, this.state.httpOnly );
	};

	render() {
		const {
			cacheTestResults: { attempts = {} },
			fields: { is_cache_enabled },
			handleAutosavingToggle,
			isDeleting,
			isReadOnly,
			isRequesting,
			isSaving,
			isTesting,
			status: { php_mod_rewrite },
			site,
			siteId,
			translate,
		} = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Caching' ) } />
				<Card>
					<form>
						<FormToggle
							checked={ !! is_cache_enabled }
							disabled={ isRequesting || isSaving || isReadOnly }
							onChange={ handleAutosavingToggle( 'is_cache_enabled' ) }
						>
							<span>{ translate( 'Enable Page Caching' ) }</span>
						</FormToggle>
					</form>
				</Card>

				{ php_mod_rewrite && (
					<Notice
						className="wp-super-cache__notice-hug-card"
						showDismiss={ false }
						text={ translate(
							'PHP caching enabled but Supercache mod_rewrite rules detected. ' +
								'Cached files will be served using those rules. If your site is working ok, please ignore this message. ' +
								'Otherwise, you can edit the .htaccess file in the root of your install and remove the SuperCache rules.'
						) }
					/>
				) }

				{ is_cache_enabled && (
					<div>
						<SectionHeader label={ translate( 'Cache Tester' ) } />
						<Card>
							<p>{ translate( 'Test your cached website by clicking the test button below.' ) }</p>

							{ isHttps( get( site, 'options.admin_url', '' ) ) && (
								<form>
									<FormFieldset>
										<FormToggle
											checked={ this.state.httpOnly }
											onChange={ this.handleHttpOnlyChange }
										>
											<span>
												{ translate( 'Send non-secure (non https) request for homepage' ) }
											</span>
										</FormToggle>
									</FormFieldset>
								</form>
							) }

							<Button compact busy={ isTesting } disabled={ isTesting } onClick={ this.testCache }>
								{ translate( 'Test Cache' ) }
							</Button>

							{ ! isEmpty( attempts ) && (
								<div>
									<span className="wp-super-cache__cache-test-results-label">
										{ translate( 'Results' ) }
									</span>
									<ul className="wp-super-cache__cache-test-results">
										{ Object.keys( attempts ).map( ( key ) => (
											<li className="wp-super-cache__cache-test-results-item" key={ key }>
												{ key === 'prime'
													? translate( 'Fetching %(url)s to prime cache', {
															args: { url: site && site.URL },
													  } )
													: translate( 'Fetching %(key)s copy of %(url)s', {
															args: {
																key: key,
																url: site && site.URL,
															},
													  } ) }
												<Gridicon
													className="wp-super-cache__cache-test-results-icon"
													icon={
														get( attempts[ key ], 'status', false )
															? 'checkmark-circle'
															: 'cross-circle'
													}
													size={ 24 }
												/>
											</li>
										) ) }
									</ul>
								</div>
							) }
						</Card>
					</div>
				) }

				<SectionHeader label={ translate( 'Delete Cached Pages' ) } />
				<Card>
					<p>
						{ translate(
							'Cached pages are stored on your server as HTML and PHP files. ' +
								'If you need to delete them, use the buttons below.'
						) }
					</p>
					<div>
						<Button
							compact
							busy={ this.state.isDeleting }
							disabled={ isDeleting || isReadOnly }
							name="wp_delete_cache"
							onClick={ this.deleteCache }
						>
							{ translate( 'Delete Cache' ) }
						</Button>
						{ site.jetpack && site.is_multisite && (
							<Button
								compact
								busy={ this.state.isDeletingAll }
								disabled={ isDeleting || isReadOnly }
								name="wp_delete_all_cache"
								onClick={ this.deleteAllCaches }
							>
								{ translate( 'Delete Cache On All Blogs' ) }
							</Button>
						) }
					</div>
				</Card>
				<QueryStatus siteId={ siteId } />
			</div>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteTitle = getSiteTitle( state, siteId );
		const isTesting = isTestingCache( state, siteId );
		const cacheTestResults = getCacheTestResults( state, siteId );
		const status = getStatus( state, siteId );

		return {
			cacheTestResults,
			isTesting,
			status,
			siteTitle,
		};
	},
	{ testCache }
);

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'cache_mod_rewrite', 'is_cache_enabled' ] );
};

export default flowRight( connectComponent, WrapSettingsForm( getFormSettings ) )( EasyTab );

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { isEmpty, get, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { isHttps } from 'lib/url';
import Button from 'components/button';
import Card from 'components/card';
import Notice from 'components/notice';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

class EasyTab extends Component {
	static propTypes = {
		cacheTestResults: PropTypes.object,
		fields: PropTypes.object,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isRequesting: PropTypes.bool,
		isSaving: PropTypes.bool,
		site: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		testCache: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		cacheTestResults: {},
		fields: {},
		isRequesting: true,
		isSaving: false,
	};

	state = {
		httpOnly: true,
		isBusy: false,
		isDeleting: false,
		isDeletingAll: false,
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isDeleting && ! nextProps.isDeleting ) {
			this.setState( {
				isDeleting: false,
				isDeletingAll: false,
			} );
		}

		if ( ! this.props.isTesting && nextProps.isTesting ) {
			this.setState( { isBusy: true } );
			return;
		}

		if ( this.props.isTesting && ! nextProps.isTesting ) {
			this.setState( { isBusy: false } );
		}
	}

	handleHttpOnlyChange = () => this.setState( { httpOnly: ! this.state.httpOnly } );

	deleteCache = () => {
		this.setState( { isDeleting: true } );
		this.props.deleteCache( this.props.siteId, false );
	}

	deleteAllCaches = () => {
		this.setState( { isDeletingAll: true } );
		this.props.deleteCache( this.props.siteId, true );
	}

	testCache = () => this.props.testCache( this.props.siteId, this.state.httpOnly );

	render() {
		const {
			cacheTestResults: {
				attempts = {},
			},
			fields: {
				cache_mod_rewrite,
				is_cache_enabled,
			},
			handleAutosavingToggle,
			isDeleting,
			isRequesting,
			isSaving,
			isTesting,
			site,
			translate,
		} = this.props;
		const enableCacheNotice = translate(
			'PHP caching is enabled but Supercache mod_rewrite rules were ' +
			'detected. Cached files will be served using those rules. If your site is working ok, ' +
			'please ignore this message. Otherwise, you can edit the .htaccess file in the root of your ' +
			'install and remove the SuperCache rules.'
		);

		return (
			<div>
				<SectionHeader
					label={ translate( 'Caching' ) }>
				</SectionHeader>
				<Card>
					<form>
						<FormToggle
							checked={ !! is_cache_enabled }
							disabled={ isRequesting || isSaving }
							onChange={ handleAutosavingToggle( 'is_cache_enabled' ) }>
							<span>
								{ translate( 'Enable Page Caching' ) }
							</span>
						</FormToggle>
					</form>
				</Card>

				{ is_cache_enabled && ! cache_mod_rewrite &&
					<Notice text={ enableCacheNotice } showDismiss={ false } className="wp-super-cache__notice-hug-card" />
				}

				{ is_cache_enabled &&
					<div>
						<SectionHeader label={ translate( 'Cache Tester' ) } />
						<Card>
							<p>
								{ translate( 'Test your cached website by clicking the test button below.' ) }
							</p>

							{ isHttps( get( site, 'options.admin_url', '' ) ) &&
								<form>
									<FormFieldset>
										<FormToggle
											checked={ this.state.httpOnly }
											onChange={ this.handleHttpOnlyChange }>
											<span>
												{ translate( 'Send non-secure (non https) request for homepage' ) }
											</span>
										</FormToggle>
									</FormFieldset>
								</form>
							}

							<Button
								compact
								busy={ this.state.isBusy }
								disabled={ isTesting }
								onClick={ this.testCache }>
								{ translate( 'Test Cache' ) }
							</Button>

							{ ! isEmpty( attempts ) &&
							<div>
								<span className="wp-super-cache__cache-test-results-label">
									{ translate( 'Results' ) }
								</span>
								<ul className="wp-super-cache__cache-test-results">
									{ Object.keys( attempts ).map( ( key ) => (
										<li className="wp-super-cache__cache-test-results-item" key={ key }>
											{ key === 'prime'
												? translate( 'Fetching %(url)s to prime cache',
													{
														args: { url: site && site.URL }
													} )
												: translate( 'Fetching %(key)s copy of %(url)s',
													{
														args: {
															key: key,
															url: site && site.URL,
														}
													} )
											}
											<Gridicon
												className="wp-super-cache__cache-test-results-icon"
												icon={ get( attempts[ key ], 'status' ) === 'OK' ? 'checkmark-circle' : 'cross-circle' }
												size={ 24 } />
										</li>
									) ) }
								</ul>
							</div>
							}
						</Card>
					</div>
				}

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
							disabled={ isDeleting }
							name="wp_delete_cache"
							onClick={ this.deleteCache }>
							{ translate( 'Delete Cache' ) }
						</Button>
						{ site.jetpack && site.is_multisite &&
							<Button
								compact
								busy={ this.state.isDeletingAll }
								disabled={ isDeleting }
								name="wp_delete_all_cache"
								onClick={ this.deleteAllCaches }>
								{ translate( 'Delete Cache On All Blogs' ) }
							</Button>
						}
					</div>
				</Card>
			</div>
		);
	}
}

const getFormSettings = settings => {
	return pick( settings, [
		'cache_mod_rewrite',
		'is_cache_enabled',
	] );
};

export default WrapSettingsForm( getFormSettings )( EasyTab );

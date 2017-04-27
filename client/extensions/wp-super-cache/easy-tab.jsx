/**
 * External dependencies
 */
import React, { Component } from 'react';
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
	state = {
		httpOnly: true,
	}

	handleHttpOnlyChange = () => this.setState( { httpOnly: ! this.state.httpOnly } );

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
			isRequesting,
			isSaving,
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
						<Button compact>
							{ translate( 'Delete Cache' ) }
						</Button>
						{ site.jetpack && site.is_multisite &&
							<Button compact>
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

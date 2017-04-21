/**
 * External dependencies
 */
import React from 'react';
import { get, pick } from 'lodash';

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

const EasyTab = ( {
	fields: {
		cache_mod_rewrite,
		http_only,
		is_cache_enabled,
	},
	handleToggle,
	isRequesting,
	site,
	translate,
} ) => {
	const enableCacheNotice = translate(
		'PHP caching is enabled but Supercache mod_rewrite rules were ' +
		'detected. Cached files will be served using those rules. If your site is working ok, ' +
		'please ignore this message. Otherwise, you can edit the .htaccess file in the root of your ' +
		'install and remove the SuperCache rules.'
	);

	return (
		<div>
			<SectionHeader label={ translate( 'Caching' ) }>
				<Button
					compact
					primary
					disabled={ isRequesting }>
					{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormToggle
						checked={ is_cache_enabled }
						disabled={ isRequesting }
						onChange={ handleToggle( 'is_cache_enabled' ) }>
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
										checked={ http_only }
										onChange={ handleToggle( 'http_only' ) }>
										<span>
											{ translate( 'Send non-secure (non https) request for homepage' ) }
										</span>
									</FormToggle>
								</FormFieldset>
							</form>
						}

						<Button compact>
							{ translate( 'Test Cache' ) }
						</Button>
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
};

const getFormSettings = settings => {
	return pick( settings, [
		'cache_mod_rewrite',
		'http_only',
		'is_cache_enabled',
	] );
};

export default WrapSettingsForm( getFormSettings )( EasyTab );

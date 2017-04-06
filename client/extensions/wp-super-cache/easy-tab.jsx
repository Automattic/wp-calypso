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
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const EasyTab = ( {
	fields: {
		scrules,
		wp_cache_enabled,
		wp_cache_mod_rewrite,
	},
	handleToggle,
	site,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Caching' ) }>
				<Button compact primary>
					{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormToggle
							checked={ wp_cache_enabled }
							onChange={ handleToggle( 'wp_cache_enabled' ) }>
							<span>
								{ translate( 'Caching On {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormToggle>
					</FormFieldset>

					{ wp_cache_enabled && ! wp_cache_mod_rewrite && scrules &&
					<p>
						{ translate( '{{strong}}Notice:{{/strong}} PHP caching enabled but Supercache mod_rewrite rules ' +
							'detected. Cached files will be served using those rules. If your site is working ok, ' +
							'please ignore this message. Otherwise, you can edit the .htaccess file in the root of your ' +
							'install and remove the SuperCache rules.',
							{
								components: { strong: <strong /> }
							}
						) }
					</p>
					}
				</form>
			</Card>

			{ wp_cache_enabled &&
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
										checked={ true }
										onChange={ handleToggle( 'wp_cache_enabled' ) }>
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
		'scrules',
		'wp_cache_enabled',
		'wp_cache_mod_rewrite',
	] );
};

export default WrapSettingsForm( getFormSettings )( EasyTab );

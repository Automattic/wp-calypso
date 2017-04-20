/**
 * External dependencies
 */
import React from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const Advanced = ( {
	fields: {
		_wp_using_ext_object_cache,
		cache_page_secret,
		super_cache_enabled,
		wp_cache_clear_on_post_edit,
		wp_cache_disable_locking,
		wp_cache_disable_utf8,
		wp_cache_front_page_checks,
		wp_cache_mfunc_enabled,
		wp_cache_mobile_browsers,
		wp_cache_mobile_enabled,
		wp_cache_mobile_prefixes,
		wp_cache_mutex_disabled,
		wp_cache_object_cache,
		wp_cache_refresh_single_only,
		wp_super_cache_late_init,
		wp_supercache_cache_list,
	},
	handleToggle,
	isRequesting,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Advanced' ) }>
				<Button
					compact
					primary
					disabled={ isRequesting }
					type="submit">
					{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormToggle
							checked={ !! wp_cache_mfunc_enabled }
							disabled={ isRequesting || ( '1' === super_cache_enabled ) }
							onChange={ handleToggle( 'wp_cache_mfunc_enabled' ) }>
							<span>
								{ translate(
								'Enable dynamic caching. Requires PHP or legacy caching. (See ' +
								'{{faq}}FAQ{{/faq}} or wp-super-cache/plugins/dynamic-cache-test.php for example code.)',
									{
										components: {
											faq: (
												<ExternalLink
													icon={ true }
													target="_blank"
													href="http://wordpress.org/plugins/wp-super-cache/faq/"
												/>
											),
										}
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_mobile_enabled }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_mobile_enabled' ) }>
							<span>
								{ translate(
									'Mobile device support. (External plugin or theme required. See the ' +
									'{{faq}}FAQ{{/faq}} for further details.)',
									{
										components: {
											faq: (
												<ExternalLink
													icon={ true }
													target="_blank"
													href="http://wordpress.org/plugins/wp-super-cache/faq/"
												/>
											),
										}
									}
								) }
							</span>
							{ !! wp_cache_mobile_enabled &&
								<FormSettingExplanation>
									{ translate(
										'{{strong}}Mobile Browsers{{/strong}}{{br/}}',
										{
											components: {
												br: <br />,
												strong: <strong />,
											}
										}
									) }
									{ wp_cache_mobile_browsers || '' }

									{ translate(
										'{{br/}}{{strong}}Mobile Prefixes{{/strong}}{{br/}}',
										{
											components: {
												br: <br />,
												strong: <strong />,
											}
										}
									) }
									{ wp_cache_mobile_prefixes || '' }
								</FormSettingExplanation>
							}
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_disable_utf8 }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_disable_utf8' ) }>
							<span>
								{ translate(
									'Remove UTF8/blog charset support from .htaccess file. Only necessary if you see ' +
									'odd characters or punctuation looks incorrect. Requires rewrite rules update.'
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_clear_on_post_edit }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_clear_on_post_edit' ) }>
							<span>
								{ translate( 'Clear all cache files when a post or page is published or updated.' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_front_page_checks }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_front_page_checks' ) }>
							<span>
								{ translate(
									'Extra homepage checks. (Very occasionally stops homepage caching) {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_refresh_single_only }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_refresh_single_only' ) }>
							<span>
								{ translate( 'Only refresh current page when comments made.' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_supercache_cache_list }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_supercache_cache_list' ) }>
							<span>
								{ translate( 'List the newest cached pages on this page.' ) }
							</span>
						</FormToggle>

						{ ! wp_cache_disable_locking &&
							<FormToggle
								checked={ !! wp_cache_mutex_disabled }
								disabled={ isRequesting }
								onChange={ handleToggle( 'wp_cache_mutex_disabled' ) }>
								<span>
									{ translate( 'Coarse file locking. You do not need this as it will slow down your website.' ) }
								</span>
							</FormToggle>
						}

						<FormToggle
							checked={ !! wp_super_cache_late_init }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_super_cache_late_init' ) }>
							<span>
								{ translate(
									'Late init. Display cached files after WordPress has loaded. Most useful in legacy mode.'
								) }
							</span>
						</FormToggle>
						{ !! _wp_using_ext_object_cache &&
							<FormToggle
								checked={ !! wp_cache_object_cache }
								disabled={ isRequesting }
								onChange={ handleToggle( 'wp_cache_object_cache' ) }>
								<span>
									{ translate( 'Use object cache to store cached files. (Experimental)' ) }
								</span>
							</FormToggle>
						}
					</FormFieldset>

					<p>
						{ translate(
							'{{strong}}DO NOT CACHE PAGE{{/strong}} secret key: ',
							{
								components: { strong: <strong /> }
							}
						) }
						<a href="">
							{ cache_page_secret || '' }
						</a>
					</p>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'_wp_using_ext_object_cache',
		'cache_page_secret',
		'super_cache_enabled',
		'wp_cache_clear_on_post_edit',
		'wp_cache_disable_locking',
		'wp_cache_disable_utf8',
		'wp_cache_front_page_checks',
		'wp_cache_mfunc_enabled',
		'wp_cache_mobile_browsers',
		'wp_cache_mobile_enabled',
		'wp_cache_mobile_prefixes',
		'wp_cache_mutex_disabled',
		'wp_cache_object_cache',
		'wp_cache_refresh_single_only',
		'wp_super_cache_late_init',
		'wp_supercache_cache_list',
	] );
};

export default WrapSettingsForm( getFormSettings )( Advanced );

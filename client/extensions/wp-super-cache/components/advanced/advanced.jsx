/**
 * External dependencies
 */

import React from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const Advanced = ( {
	fields: {
		cache_disable_locking,
		cache_late_init,
		cache_list,
		cache_mobile_browsers,
		cache_mobile_prefixes,
		cache_mod_rewrite,
		clear_cache_on_post_edit,
		disable_utf8,
		front_page_checks,
		is_mfunc_enabled,
		is_mobile_enabled,
		refresh_current_only_on_comments,
	},
	handleAutosavingToggle,
	isReadOnly,
	isRequesting,
	isSaving,
	translate,
} ) => {
	const isDisabled = isRequesting || isSaving || isReadOnly;

	return (
		<div>
			<SectionHeader label={ translate( 'Advanced' ) } />
			<Card>
				<form>
					<FormFieldset>
						<FormToggle
							checked={ !! is_mfunc_enabled }
							disabled={ isDisabled || !! cache_mod_rewrite }
							onChange={ handleAutosavingToggle( 'is_mfunc_enabled' ) }
						>
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
										},
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! is_mobile_enabled }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'is_mobile_enabled' ) }
						>
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
										},
									}
								) }
							</span>
							{ is_mobile_enabled && (
								<FormSettingExplanation>
									{ translate( '{{strong}}Mobile Browsers{{/strong}}{{br/}}', {
										components: {
											br: <br />,
											strong: <strong />,
										},
									} ) }
									{ cache_mobile_browsers || '' }

									{ translate( '{{br/}}{{strong}}Mobile Prefixes{{/strong}}{{br/}}', {
										components: {
											br: <br />,
											strong: <strong />,
										},
									} ) }
									{ cache_mobile_prefixes || '' }
								</FormSettingExplanation>
							) }
						</FormToggle>

						<FormToggle
							checked={ !! disable_utf8 }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'disable_utf8' ) }
						>
							<span>
								{ translate(
									'Remove UTF8/blog charset support from .htaccess file. Only necessary if you see ' +
										'odd characters or punctuation looks incorrect. Requires rewrite rules update.'
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! clear_cache_on_post_edit }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'clear_cache_on_post_edit' ) }
						>
							<span>
								{ translate(
									'Clear all cache files when a post or page is published or updated.'
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! front_page_checks }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'front_page_checks' ) }
						>
							<span>
								{ translate(
									'Extra homepage checks. (Very occasionally stops homepage caching) {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> },
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! refresh_current_only_on_comments }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'refresh_current_only_on_comments' ) }
						>
							<span>{ translate( 'Only refresh current page when comments made.' ) }</span>
						</FormToggle>

						<FormToggle
							checked={ !! cache_list }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'cache_list' ) }
						>
							<span>{ translate( 'List the newest cached pages on this page.' ) }</span>
						</FormToggle>

						<FormToggle
							checked={ ! cache_disable_locking }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'cache_disable_locking' ) }
						>
							<span>
								{ translate(
									'Coarse file locking. You do not need this as it will slow down your website.'
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! cache_late_init }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'cache_late_init' ) }
						>
							<span>
								{ translate(
									'Late init. Display cached files after WordPress has loaded. Most useful in legacy mode.'
								) }
							</span>
						</FormToggle>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = ( settings ) => {
	return pick( settings, [
		'cache_disable_locking',
		'cache_late_init',
		'cache_list',
		'cache_mobile_browsers',
		'cache_mobile_prefixes',
		'cache_mod_rewrite',
		'clear_cache_on_post_edit',
		'disable_utf8',
		'front_page_checks',
		'is_mfunc_enabled',
		'is_mobile_enabled',
		'refresh_current_only_on_comments',
	] );
};

export default WrapSettingsForm( getFormSettings )( Advanced );

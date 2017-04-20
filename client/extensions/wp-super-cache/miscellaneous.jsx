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

const Miscellaneous = ( {
	fields: {
		cache_compression,
		cache_rebuild_files,
		super_cache_enabled,
		wp_cache_compression_disabled,
		wp_cache_hello_world,
		wp_cache_make_known_anon,
		wp_cache_no_cache_for_get,
		wp_cache_not_logged_in,
		wp_supercache_304,
	},
	handleToggle,
	isRequesting,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Miscellaneous' ) }>
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
					{ !! wp_cache_compression_disabled &&
					<p>
						{ translate(
							' {{em}}Warning! Compression is disabled as gzencode() function was not found.{{/em}}',
							{
								components: { em: <em /> }
							}
						) }
					</p>
					}
					<FormFieldset>
						{ ! wp_cache_compression_disabled &&
						<FormToggle
							checked={ !! cache_compression }
							disabled={ isRequesting }
							onChange={ handleToggle( 'cache_compression' ) }>
							<span>
								{ translate(
									'Compress pages so they’re served more quickly to visitors. {{em}}(Recommended{{/em}})',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormToggle>
						}

						<FormToggle
							checked={ !! wp_cache_not_logged_in }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_not_logged_in' ) }>
							<span>
								{ translate(
									'Don’t cache pages for known users. {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! cache_rebuild_files }
							disabled={ isRequesting }
							onChange={ handleToggle( 'cache_rebuild_files' ) }>
							<span>
								{ translate(
									'Cache rebuild. Serve a supercache file to anonymous users while a new ' +
									'file is being generated. {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_supercache_304 }
							disabled={ isRequesting || ( '1' === super_cache_enabled ) }
							onChange={ handleToggle( 'wp_supercache_304' ) }>
							<span>
								{ translate(
									'304 Not Modified browser caching. Indicate when a page has not been ' +
									'modified since it was last requested. {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
							{ '1' === super_cache_enabled &&
								<FormSettingExplanation>
									{ translate(
										'{{strong}}Warning! 304 browser caching is only supported when mod_rewrite caching ' +
										'is not used.{{/strong}}',
										{
											components: { strong: <strong /> }
										}
									) }
								</FormSettingExplanation>
							}
							{ '1' !== super_cache_enabled &&
								<FormSettingExplanation>
									{ translate(
										'304 support is disabled by default because some hosts have had problems with the ' +
										'headers used in the past.'
									) }
								</FormSettingExplanation>
							}
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_no_cache_for_get }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_no_cache_for_get' ) }>
							<span>
								{ translate( 'Don’t cache pages with GET parameters. (?x=y at the end of a url)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_make_known_anon }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_make_known_anon' ) }>
							<span>
								{ translate( 'Make known users anonymous so they’re served supercached static files.' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! wp_cache_hello_world }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_hello_world' ) }>
							<span>
								{ translate( 'Proudly tell the world your server is {{fry}}Stephen Fry proof{{/fry}}! ' +
									'(places a message in your blog’s footer)',
									{
										components: {
											fry: (
												<ExternalLink
													icon={ true }
													target="_blank"
													href="https://twitter.com/#!/HibbsLupusTrust/statuses/136429993059291136"
												/>
											),
										}
									}
							) }
							</span>
						</FormToggle>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'cache_compression',
		'cache_rebuild_files',
		'super_cache_enabled',
		'wp_cache_compression_disabled',
		'wp_cache_hello_world',
		'wp_cache_make_known_anon',
		'wp_cache_no_cache_for_get',
		'wp_cache_not_logged_in',
		'wp_supercache_304',
	] );
};

export default WrapSettingsForm( getFormSettings )( Miscellaneous );

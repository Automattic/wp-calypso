/**
 * External dependencies
 */

import React from 'react';
import { includes, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import Notice from 'components/notice';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const Caching = ( {
	fields: { cache_type, is_cache_enabled },
	handleAutosavingToggle,
	handleRadio,
	handleSubmitForm,
	isReadOnly,
	isRequesting,
	isSaving,
	status: { htaccess_ro: htaccessReadOnly, mod_rewrite_missing: modRewriteMissing },
	translate,
} ) => {
	const isDisabled = isRequesting || isSaving || isReadOnly;

	return (
		<div>
			<SectionHeader label={ translate( 'Caching' ) }>
				<Button compact primary disabled={ isDisabled } onClick={ handleSubmitForm }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					{ htaccessReadOnly && (
						<Notice
							showDismiss={ false }
							status="is-warning"
							text={ translate(
								'The .htaccess file is readonly and cannot be updated. Cache files ' +
									'will still be served by PHP. See {{a}}Changing File Permissions{{/a}} on WordPress.org ' +
									'for help on fixing this.',
								{
									components: {
										a: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="https://codex.wordpress.org/Changing_File_Permissions"
											/>
										),
									},
								}
							) }
						/>
					) }

					{ modRewriteMissing && (
						<Notice
							showDismiss={ false }
							status="is-warning"
							text={ translate(
								'The mod_rewrite module has not been detected. Cache files will still be served by PHP.'
							) }
						/>
					) }
					<FormFieldset>
						<FormToggle
							checked={ !! is_cache_enabled }
							disabled={ isDisabled }
							onChange={ handleAutosavingToggle( 'is_cache_enabled' ) }
						>
							<span>{ translate( 'Enable Page Caching' ) }</span>
						</FormToggle>
					</FormFieldset>

					<FormFieldset className="wp-super-cache__cache-type-fieldset">
						<FormLabel>
							<FormRadio
								checked={ includes( [ 'PHP', 'wpcache' ], cache_type ) /* wpcache is legacy */ }
								disabled={ isDisabled || ! is_cache_enabled }
								name="cache_type"
								onChange={ handleRadio }
								value="PHP"
							/>
							<span>
								{ translate( 'Simple {{em}}(Recommended){{/em}}', {
									components: { em: <em /> },
								} ) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ 'mod_rewrite' === cache_type }
								disabled={ isDisabled || ! is_cache_enabled }
								name="cache_type"
								onChange={ handleRadio }
								value="mod_rewrite"
							/>
							<span>{ translate( 'Expert' ) }</span>
						</FormLabel>
						<FormSettingExplanation>
							{ translate(
								'Expert caching requires changes to important server files ' +
									'and may require manual intervention if enabled.'
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'cache_type', 'is_cache_enabled' ] );
};

export default WrapSettingsForm( getFormSettings )( Caching );

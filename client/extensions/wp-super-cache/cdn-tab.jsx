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
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const CdnTab = ( {
	fields: {
		ossdl_cname,
		ossdl_https,
		ossdl_off_cdn_url,
		ossdl_off_exclude,
		ossdl_off_include_dirs,
		ossdlcdn,
	},
	handleChange,
	handleToggle,
	isRequesting,
	siteUrl,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'CDN' ) }>
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
							checked={ !! ossdlcdn }
							disabled={ isRequesting }
							onChange={ handleToggle( 'ossdlcdn' ) }>
							<span>
								{ translate( 'Enable CDN Support' ) }
							</span>
						</FormToggle>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="ossdl_off_cdn_url">
							{ translate( 'Off-site URL' ) }
						</FormLabel>

						<FormTextInput
							disabled={ isRequesting }
							id="ossdl_off_cdn_url"
							onChange={ handleChange( 'ossdl_off_cdn_url' ) }
							value={ ossdl_off_cdn_url || '' } />

						<FormSettingExplanation>
							{ translate(
								'The new URL to be used in place of %(url)s for rewriting. No trailing / please.',
								{
									args: { url: siteUrl },
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="ossdl_off_include_dirs">
							{ translate( 'Include directories' ) }
						</FormLabel>

						<FormTextInput
							disabled={ isRequesting }
							id="ossdl_off_include_dirs"
							onChange={ handleChange( 'ossdl_off_include_dirs' ) }
							value={ ossdl_off_include_dirs || '' } />

						<FormSettingExplanation>
							{ translate(
								'Directories to include in static file matching. Use a comma as the delimiter. Default is ' +
								'{{code}}wp-content, wp-includes{{/code}}, which will be enforced if this field is left empty.',
								{
									components: { code: <code /> }
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="ossdl_off_exclude">
							{ translate( 'Exclude if substring' ) }
						</FormLabel>

						<FormTextInput
							disabled={ isRequesting }
							id="ossdl_off_exclude"
							onChange={ handleChange( 'ossdl_off_exclude' ) }
							value={ ossdl_off_exclude || '' } />

						<FormSettingExplanation>
							{ translate(
								'Excludes something from being rewritten if one of the above strings is found in the match. ' +
								'Use a comma as the delimiter like this, {{code}}.php, .flv, .do{{/code}}, and always ' +
								'include {{code}}.php{{/code}} (default).',
								{
									components: { code: <code /> }
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="ossdl_cname">
							{ translate( 'Additional CNAMES' ) }
						</FormLabel>

						<FormTextInput
							disabled={ isRequesting }
							id="ossdl_cname"
							onChange={ handleChange( 'ossdl_cname' ) }
							value={ ossdl_cname || '' } />

						<FormSettingExplanation>
							{ translate(
								'These {{a}}CNAMES{{/a}} will be used in place of %(url)s for rewriting (in addition to the ' +
								'off-site URL above). Use a comma as the delimiter. For pages with a large number of static files, ' +
								'this can improve browser performance. CNAMEs may also need to be configured on your CDN.',
								{
									args: {
										url: siteUrl,
									},
									components: {
										a: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="http://en.wikipedia.org/wiki/CNAME_record"
											/>
										),
									}
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormToggle
							checked={ !! ossdl_https }
							disabled={ isRequesting }
							onChange={ handleToggle( 'ossdl_https' ) }>
							<span>
								{ translate( 'Skip https URLs to avoid "mixed content" errors' ) }
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
		'ossdl_cname',
		'ossdl_https',
		'ossdl_off_cdn_url',
		'ossdl_off_exclude',
		'ossdl_off_include_dirs',
		'ossdlcdn',
	] );
};

export default WrapSettingsForm( getFormSettings )( CdnTab );

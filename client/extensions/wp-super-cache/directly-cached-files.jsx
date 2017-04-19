/**
 * External dependencies
 */
import React, { Component } from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

class DirectlyCachedFiles extends Component {
	onKeyDown = event => {
		if ( 13 !== event.keyCode ) {
			return;
		}

		const newDirectPage = this.refs.newDirectPage.refs.textField;

		if ( '' === newDirectPage.value.trim() ) {
			return;
		}

		newDirectPage.value = '';
		this.props.handleSubmitForm( event );
	};

	render() {
		const {
			fields,
			handleChange,
			handleSubmitForm,
			isRequesting,
			isSaving,
			setFieldArrayValue,
			siteUrl,
			translate
		} = this.props;
		const {
			cache_direct_pages = [],
			cache_path,
			cache_readonly,
			cache_writable,
		} = fields;

		return (
			<div>
				<SectionHeader label={ translate( 'Directly Cached Files' ) }>
					<Button
						compact
						primary
						disabled={ isRequesting || isSaving }
						onClick={ handleSubmitForm }>
						{ isSaving
							? translate( 'Saving…' )
							: translate( 'Save Settings' )
						}
					</Button>
				</SectionHeader>
				<Card className="wp-super-cache__directly-cached-files">
					{ cache_readonly &&
					<p>
					{ translate(
						'{{strong}}Warning!{{/strong}} You must make %(cache_path)s writable to enable this feature. ' +
						'As this is a security risk, please make it read-only after your page is generated.',
						{
							args: { cache_path: cache_path },
							components: { strong: <strong /> },
						}
					) }
					</p>
					}
					{ cache_writable &&
					<p>
					{ translate(
						'{{strong}}Warning!{{/strong}} %(cache_path)s is writable. Please make it readonly ' +
						'after your page is generated as this is a security risk.',
						{
							args: { cache_path: cache_path },
							components: { strong: <strong /> },
						}
					) }
					</p>
					}
					<p>
						{ translate(
							'Directly cached files are files created directly off %(cache_path)s where your blog lives. This ' +
							'feature is only useful if you are expecting a major Digg or Slashdot level of traffic to one post or page.',
							{
								args: { cache_path: cache_path },
							}
						) }
					</p>
						{ ! cache_readonly &&
						<div>
							<p>
								{ translate(
									'For example: to cache {{em}}%(url)s/about/{{/em}}, you would enter %(url)s/about/ or /about/. ' +
									'The cached file will be generated the next time an anonymous user visits that page.',
									{
										args: { url: siteUrl },
										components: { em: <em /> },
									}
								) }
							</p>
							<form>
								<FormFieldset>
									<FormTextInput
										disabled={ isRequesting || isSaving }
										onChange={ handleChange( 'new_direct_page' ) }
										onKeyDown={ this.onKeyDown }
										ref="newDirectPage" />
								</FormFieldset>

								{ cache_direct_pages.length > 0 &&
								<FormLabel>
									{ translate(
										'Existing Direct Page',
										'Existing Direct Pages',
										{ count: cache_direct_pages.length }
									) }
								</FormLabel>
								}

								{ cache_direct_pages.map( ( page, index ) => (
									<FormFieldset key={ index }>
										<FormTextInput
											disabled={ isRequesting || isSaving }
											key={ index }
											onChange={ setFieldArrayValue( 'cache_direct_pages', index ) }
											value={ page || '' } />
									</FormFieldset>
								) ) }

								{ cache_direct_pages.length > 0 &&
								<FormSettingExplanation>
									{ translate(
										'Make the textbox blank to remove it from the list of direct pages and delete the cached file.'
									) }
								</FormSettingExplanation>
								}
							</form>
						</div>
						}
				</Card>
			</div>
		);
	}
}

const getFormSettings = settings => {
	return pick( settings, [
		'cache_direct_pages',
		'cache_path',
		'cache_readonly',
		'cache_writable',
	] );
};

export default WrapSettingsForm( getFormSettings )( DirectlyCachedFiles );

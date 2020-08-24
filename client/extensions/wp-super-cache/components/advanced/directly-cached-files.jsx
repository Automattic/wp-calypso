/**
 * External dependencies
 */

import React, { Component } from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

class DirectlyCachedFiles extends Component {
	onKeyDown = ( event ) => {
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
			deleteFieldArrayValue,
			fields,
			handleChange,
			handleSubmitForm,
			isRequesting,
			isSaving,
			site,
			translate,
		} = this.props;
		const cache_direct_pages = fields.cache_direct_pages || [];
		const cache_path = fields.cache_path || '';

		return (
			<div>
				<SectionHeader label={ translate( 'Directly Cached Files' ) }>
					<Button
						compact
						primary
						disabled={ isRequesting || isSaving }
						onClick={ handleSubmitForm }
					>
						{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card className="wp-super-cache__directly-cached-files">
					<p>
						{ translate(
							'Directly cached files are files created directly off %(cache_path)s where your blog lives. This ' +
								'feature is only useful if you are expecting a major Digg or Slashdot level of traffic to one post or page.',
							{
								args: { cache_path: cache_path },
							}
						) }
					</p>
					<div>
						<p>
							{ translate(
								'For example: to cache {{em}}%(url)s/about/{{/em}}, you would enter %(url)s/about/ or /about/. ' +
									'The cached file will be generated the next time an anonymous user visits that page.',
								{
									args: { url: site && site.URL },
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
									ref="newDirectPage"
								/>
							</FormFieldset>

							{ cache_direct_pages.length > 0 && (
								<FormLabel>
									{ translate( 'Existing Direct Page', 'Existing Direct Pages', {
										count: cache_direct_pages.length,
									} ) }
								</FormLabel>
							) }

							{ cache_direct_pages.map( ( page, index ) => (
								<FormFieldset key={ index }>
									<FormTextInput disabled={ true } key={ index } value={ page || '' } />
									<Button
										compact
										className="wp-super-cache__directly-cached-files-delete"
										onClick={ deleteFieldArrayValue( 'cache_direct_pages', index ) }
									>
										{ translate( 'Delete' ) }
									</Button>
								</FormFieldset>
							) ) }
						</form>
					</div>
				</Card>
			</div>
		);
	}
}

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'cache_direct_pages', 'cache_path' ] );
};

export default WrapSettingsForm( getFormSettings )( DirectlyCachedFiles );

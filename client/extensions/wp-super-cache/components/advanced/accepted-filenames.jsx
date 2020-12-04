/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormLabel from 'calypso/components/forms/form-label';
import FormToggle from 'calypso/components/forms/form-toggle';
import SectionHeader from 'calypso/components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

class AcceptedFilenames extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleChange: PropTypes.func.isRequired,
		handleSubmitForm: PropTypes.func.isRequired,
		isReadOnly: PropTypes.bool.isRequired,
		isRequesting: PropTypes.bool,
		isSaving: PropTypes.bool,
		setFieldValue: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
		isRequesting: true,
		isSaving: false,
	};

	renderToggle = ( fieldName, fieldLabel, parent ) => {
		const {
			fields: { pages },
			isReadOnly,
			isRequesting,
			isSaving,
		} = this.props;

		return (
			<FormToggle
				checked={ get( pages, fieldName, false ) }
				disabled={ isRequesting || isSaving || isReadOnly || ! get( pages, parent, true ) }
				onChange={ this.handleToggle( fieldName ) }
			>
				<span>{ fieldLabel }</span>
			</FormToggle>
		);
	};

	handleToggle = ( fieldName ) => {
		return () => {
			const { fields, setFieldValue } = this.props;
			const groupName = 'pages';
			const groupFields = fields[ groupName ] ? fields[ groupName ] : {};

			if ( ! ( fieldName in groupFields ) ) {
				return;
			}

			groupFields[ fieldName ] = ! groupFields[ fieldName ];
			setFieldValue( groupName, groupFields );
		};
	};

	render() {
		const {
			fields,
			handleChange,
			handleSubmitForm,
			isReadOnly,
			isRequesting,
			isSaving,
			translate,
		} = this.props;
		const { cache_acceptable_files, cache_rejected_uri } = fields;
		const isDisabled = isRequesting || isSaving || isReadOnly;

		return (
			<div>
				<SectionHeader label={ translate( 'Accepted Filenames & Rejected URIs' ) }>
					<Button compact primary disabled={ isDisabled } onClick={ handleSubmitForm }>
						{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card>
					<form>
						<FormLabel>{ translate( 'Do not cache these page types.' ) }</FormLabel>
						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<FormSettingExplanation className="wp-super-cache__condition-settings-explanation">
							{ translate(
								' See the {{a}}Conditional Tags{{/a}} ' +
									'documentation for a complete discussion on each type.',
								{
									components: {
										a: (
											<ExternalLink
												icon
												target="_blank"
												href="http://codex.wordpress.org/Conditional_Tags"
											/>
										),
									},
								}
							) }
						</FormSettingExplanation>

						<FormFieldset>
							{ this.renderToggle( 'single', translate( 'Single Posts (is_single)' ) ) }
							{ this.renderToggle( 'pages', translate( 'Pages (is_page)' ) ) }
							{ this.renderToggle( 'frontpage', translate( 'Front Page (is_front_page)' ) ) }

							{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
							<div className="wp-super-cache__nested-page-types">
								{ this.renderToggle( 'home', translate( 'Home (is_home)' ), 'frontpage' ) }
							</div>
							{ this.renderToggle( 'archives', translate( 'Archives (is_archive)' ) ) }

							{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
							<div className="wp-super-cache__nested-page-types">
								{ this.renderToggle( 'tag', translate( 'Tags (is_tag)' ), 'archives' ) }
								{ this.renderToggle(
									'category',
									translate( 'Category (is_category)' ),
									'archives'
								) }
							</div>
							{ this.renderToggle( 'feed', translate( 'Feeds (is_feed)' ) ) }
							{ this.renderToggle( 'search', translate( 'Search Pages (is_search)' ) ) }
							{ this.renderToggle( 'author', translate( 'Author Pages (is_author)' ) ) }
						</FormFieldset>

						<FormFieldset>
							<FormLabel>
								{ translate( 'Do not cache pages that contain the following strings:' ) }
							</FormLabel>
							<FormTextarea
								disabled={ isDisabled }
								onChange={ handleChange( 'cache_rejected_uri' ) }
								value={ cache_rejected_uri }
							/>
							<FormSettingExplanation>
								{ translate(
									'Add here strings (not a filename) that forces a page not to be cached. For example, ' +
										'if your URLs include year and you dont want to cache last year posts, it’s enough ' +
										'to specify the year, i.e. ’/2004/’. WP-Cache will search if that string is part ' +
										'of the URI and if so, it will not cache that page.'
								) }
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel>{ translate( 'Allowed filenames:' ) }</FormLabel>
							<FormTextarea
								disabled={ isDisabled }
								onChange={ handleChange( 'cache_acceptable_files' ) }
								value={ cache_acceptable_files }
							/>
							<FormSettingExplanation>
								{ translate(
									'Add here those filenames that can be cached, even if they match one of the rejected ' +
										'substring specified above.'
								) }
							</FormSettingExplanation>
						</FormFieldset>
					</form>
				</Card>
			</div>
		);
	}
}

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'cache_acceptable_files', 'cache_rejected_uri', 'pages' ] );
};

export default WrapSettingsForm( getFormSettings )( AcceptedFilenames );

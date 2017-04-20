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
import FormTextarea from 'components/forms/form-textarea';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const AcceptedFilenames = ( {
	fields: {
		archives,
		author,
		category,
		feed,
		frontpage,
		home,
		pages,
		search,
		single,
		tag,
		wp_accepted_files,
		wp_rejected_uri,
	},
	handleChange,
	handleToggle,
	isRequesting,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Accepted Filenames & Rejected URIs' ) }>
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
							checked={ !! single }
							disabled={ isRequesting }
							onChange={ handleToggle( 'single' ) }>
							<span>
								{ translate( 'Single Posts (is_single)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! pages }
							disabled={ isRequesting }
							onChange={ handleToggle( 'pages' ) }>
							<span>
								{ translate( 'Pages (is_page)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! frontpage }
							disabled={ isRequesting }
							onChange={ handleToggle( 'frontpage' ) }>
							<span>
								{ translate( 'Front Page (is_front_page)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! home }
							disabled={ isRequesting }
							onChange={ handleToggle( 'home' ) }>
							<span>
								{ translate( 'Home (is_home)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! archives }
							disabled={ isRequesting }
							onChange={ handleToggle( 'archives' ) }>
							<span>
								{ translate( 'Archives (is_archive)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! tag }
							disabled={ isRequesting }
							onChange={ handleToggle( 'tag' ) }>
							<span>
								{ translate( 'Tags (is_tag)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! category }
							disabled={ isRequesting }
							onChange={ handleToggle( 'category' ) }>
							<span>
								{ translate( 'Category (is_category)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! feed }
							disabled={ isRequesting }
							onChange={ handleToggle( 'feed' ) }>
							<span>
								{ translate( 'Feeds (is_feed)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! search }
							disabled={ isRequesting }
							onChange={ handleToggle( 'search' ) }>
							<span>
								{ translate( 'Search Pages (is_search)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! author }
							disabled={ isRequesting }
							onChange={ handleToggle( 'author' ) }>
							<span>
								{ translate( 'Author Pages (is_author)' ) }
							</span>
						</FormToggle>
						<FormSettingExplanation>
							{ translate(
								'Do not cache these page types. See the {{a}}Conditional Tags{{/a}} ' +
								'documentation for a complete discussion on each type.',
								{
									components: {
										a: (
											<ExternalLink
												icon={ true }
												target="_blank"
												href="http://codex.wordpress.org/Conditional_Tags"
											/>
										),
									}
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormTextarea
							disabled={ isRequesting }
							onChange={ handleChange( 'wp_rejected_uri' ) }
							value={ wp_rejected_uri || '' } />
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
						<FormTextarea
							disabled={ isRequesting }
							onChange={ handleChange( 'wp_accepted_files' ) }
							value={ wp_accepted_files || '' } />
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
};

const getFormSettings = settings => {
	const textSettings = pick( settings, [
		'wp_accepted_files',
		'wp_rejected_uri',
	] );
	const wpCachePages = pick( settings.wp_cache_pages, [
		'archives',
		'author',
		'category',
		'feed',
		'frontpage',
		'home',
		'pages',
		'search',
		'single',
		'tag',
	] );

	return Object.assign( {}, textSettings, wpCachePages );
};

export default WrapSettingsForm( getFormSettings )( AcceptedFilenames );

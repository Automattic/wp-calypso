/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import MultiCheckbox from 'components/forms/multi-checkbox';
import SectionHeader from 'components/section-header';

const AcceptedFilenames = ( { checked, onChange, translate } ) => {
	const options = [
		{
			value: 'single',
			label: translate( 'Single Posts (is_single)' ),
		},
		{
			value: 'pages',
			label: translate( 'Pages (is_page)' ),
		},
		{
			value: 'frontpage',
			label: translate( 'Front Page (is_front_page)' ),
		},
		{
			value: 'home',
			label: translate( 'Home (is_home)' ),
		},
		{
			value: 'archives',
			label: translate( 'Archives (is_archive)' ),
		},
		{
			value: 'tag',
			label: translate( 'Tags (is_tag)' ),
		},
		{
			value: 'category',
			label: translate( 'Category (is_category)' ),
		},
		{
			value: 'feed',
			label: translate( 'Feeds (is_feed)' ),
		},
		{
			value: 'search',
			label: translate( 'Search Pages (is_search)' ),
		},
		{
			value: 'author',
			label: translate( 'Author Pages (is_author)' ),
		},
	];

	return (
		<div>
			<SectionHeader label={ translate( 'Accepted Filenames & Rejected URIs' ) }>
				<Button
					compact={ true }
					primary={ true }
					type="submit">
						{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<p>
					{ translate(
						'Do not cache the following page types. See the {{a}}Conditional Tags{{/a}} documentation ' +
						'for a complete discussion on each type.',
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
				</p>
				<form>
					<FormFieldset>
						<MultiCheckbox
							checked={ checked }
							name="wp_cache_pages"
							onChange={ onChange }
							options={ options } />
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

AcceptedFilenames.propTypes = {
	checked: PropTypes.array,
	onChange: PropTypes.func,
	translate: PropTypes.func,
};

AcceptedFilenames.defaultProps = {
	onChange: noop,
};

export default localize( AcceptedFilenames );

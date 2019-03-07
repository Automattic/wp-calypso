/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import CompactCard from 'components/card/compact';

class DescriptiveHeader extends PureComponent {
	render() {
		const { site, translate } = this.props;
		const { slug, title: siteTitle } = site;

		const title = siteTitle.length ? siteTitle : slug;
		const description = translate(
			'Import content from another site into ' +
				'{{strong}}%(title)s{{/strong}}. Learn more about ' +
				'the import process in our {{a}}support documentation{{/a}}. ' +
				'Once you start importing, you can visit ' +
				'this page to check on the progress.',
			{
				args: { title },
				components: {
					a: <a href="https://support.wordpress.com/import/" />,
					strong: <strong />,
				},
			}
		);

		return (
			<CompactCard>
				<header>
					{ /* @TODO move these class names over  */ }
					<p className="settings-import__section-description site-settings__importer-section-description">
						{ description }
					</p>
				</header>
			</CompactCard>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( DescriptiveHeader ) );

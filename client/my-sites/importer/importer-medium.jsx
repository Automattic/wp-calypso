/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';
import InlineSupportLink from 'components/inline-support-link';
import { getImporterTitleByEngineKey } from 'lib/importers/utils';

/**
 * Module variables
 */
const importerData = {
	title: getImporterTitleByEngineKey( 'medium' ),
	icon: 'medium',
};

class ImporterMedium extends React.PureComponent {
	static displayName = 'ImporterMedium';

	render() {
		importerData.description = this.props.translate(
			'Import posts, tags, images, and videos ' + 'from a Medium export file.'
		);

		importerData.uploadDescription = this.props.translate(
			'Upload your {{b}}%(importerName)s export file{{/b}} to start importing into ' +
				'{{b}}%(siteTitle)s{{/b}}. A %(importerName)s export file is a ZIP ' +
				'file containing several HTML files with your stories. ' +
				'Need help {{inlineSupportLink/}}?',
			{
				args: {
					importerName: importerData.title,
					siteTitle: this.props.site.title,
				},
				components: {
					b: <strong />,
					inlineSupportLink: (
						<InlineSupportLink
							supportPostId={ 93180 }
							supportLink={ 'https://en.support.wordpress.com/import/import-from-medium/' }
							text={ this.props.translate( 'exporting your content' ) }
							showIcon={ false }
						/>
					),
				},
			}
		);

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterMedium );

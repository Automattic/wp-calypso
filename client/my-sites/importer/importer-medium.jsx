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

/**
 * Module variables
 */
const importerData = {
	title: 'Medium',
	icon: 'medium',
};

class ImporterMedium extends React.PureComponent {
	static displayName = 'ImporterMedium';

	render() {
		importerData.description = this.props.translate(
			'Import posts, tags, images, and videos ' + 'from a Medium export file.'
		);

		importerData.uploadDescription = this.props.translate(
			'Upload a {{b}}Medium export file{{/b}} to start ' + 'importing into {{b2}}%(title)s{{/b2}}.',
			{
				args: { title: this.props.site.title },
				components: {
					b: <strong />,
					b2: <strong />,
				},
			}
		);

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterMedium );

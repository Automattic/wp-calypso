/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
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
	title: 'Blogger.com',
	icon: 'blogger',
};

class ImporterBlogger extends React.PureComponent {
	static displayName = 'ImporterBlogger';

	static propTypes = {
		site: PropTypes.shape( {
			title: PropTypes.string.isRequired,
		} ).isRequired,
		importerStatus: PropTypes.shape( {
			filename: PropTypes.string,
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			percentComplete: PropTypes.number,
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		importerData.description = this.props.translate(
			'Import posts, pages, comments, tags and images ' + 'from a Blogger.com export file.'
		);

		importerData.uploadDescription = this.props.translate(
			'Upload a {{b}}Blogger.com export file{{/b}} to start ' +
				'importing into {{b2}}%(title)s{{/b2}}.',
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

export default localize( ImporterBlogger );

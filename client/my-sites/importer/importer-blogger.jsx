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

const importerName = 'Blogger.com';

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
		const importerData = {
			title: importerName,
			icon: 'blogger-alt',
			description: this.props.translate(
				'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
				{
					args: {
						importerName,
					},
				}
			),
			uploadDescription: this.props.translate(
				'Upload a {{b}}%(importerName)s export file{{/b}} to start importing into {{b}}%(siteTitle)s{{/b}}.',
				{
					args: {
						importerName,
						siteTitle: this.props.site.title,
					},
					components: {
						b: <strong />,
					},
				}
			),
		};
		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterBlogger );

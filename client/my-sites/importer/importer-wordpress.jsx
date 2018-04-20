/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';

class ImporterWordPress extends React.PureComponent {
	static displayName = 'ImporterWordPress';

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

	importerData = {
		title: 'WordPress',
		icon: 'wordpress',
		description: this.props.translate(
			'Import posts, pages, and media from a WordPress export\u00A0file.'
		),
		uploadDescription: this.props.translate(
			'Upload a {{b}}WordPress export file{{/b}} to start ' +
				'importing into {{b}}%(title)s{{/b}}. Check out our ' +
				'{{a}}WordPress export guide{{/a}} if you need ' +
				'help exporting the file.',
			{
				args: { title: this.props.site.title },
				components: {
					b: <strong />,
					a: <a href="https://en.support.wordpress.com/export/" />,
				},
			}
		),
	};

	render() {
		return <FileImporter importerData={ this.importerData } { ...this.props } />;
	}
}

export default localize( ImporterWordPress );

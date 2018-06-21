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

class ImporterMedium extends React.PureComponent {
	static displayName = 'ImporterMedium';

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
		title: 'Medium',
		icon: 'medium',
		description: this.props.translate(
			'Import posts, tags, images, and videos from a Medium export file.'
		),
		uploadDescription: this.props.translate(
			'Upload a {{b}}Medium export file{{/b}} to start importing into {{b}}%(title)s{{/b}}.',
			{
				args: { title: this.props.site.title },
				components: {
					b: <strong />,
				},
			}
		),
	};

	render() {
		return <FileImporter importerData={ this.importerData } { ...this.props } />;
	}
}

export default localize( ImporterMedium );

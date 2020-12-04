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
import importerConfig from 'calypso/lib/importer/importer-config';

class ImporterBlogger extends React.PureComponent {
	static displayName = 'ImporterBlogger';

	static propTypes = {
		site: PropTypes.shape( {
			title: PropTypes.string.isRequired,
		} ).isRequired,
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).blogger;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterBlogger );

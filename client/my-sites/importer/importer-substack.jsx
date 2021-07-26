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

class ImporterSubstack extends React.PureComponent {
	static displayName = 'ImporterSubstack';

	static propTypes = {
		site: PropTypes.shape( {
			title: PropTypes.string.isRequired,
		} ).isRequired,
		siteTitle: PropTypes.string.isRequired,
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).substack;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterSubstack );

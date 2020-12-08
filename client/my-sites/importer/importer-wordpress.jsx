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
import importerConfig from 'calypso/lib/importer/importer-config';

class ImporterWordPress extends React.PureComponent {
	static displayName = 'ImporterWordPress';

	static propTypes = {
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
		} ).wordpress;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterWordPress );

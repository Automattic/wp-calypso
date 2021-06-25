/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';
import importerConfig from 'calypso/lib/importer/importer-config';

class ImporterMedium extends React.PureComponent {
	static displayName = 'ImporterMedium';

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).medium;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterMedium );

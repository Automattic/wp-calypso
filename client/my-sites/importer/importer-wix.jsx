/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import SiteImporter from './site-importer';
import importerConfig from 'calypso/lib/importer/importer-config';

class ImporterWix extends React.PureComponent {
	static displayName = 'ImporterWix';

	static propTypes = {
		siteTitle: PropTypes.string.isRequired,
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			statusMessage: PropTypes.string,
		} ),
		fromSite: PropTypes.string,
	};

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).wix;

		return <SiteImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterWix );

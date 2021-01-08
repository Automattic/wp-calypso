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

class ImporterGoDaddyGoCentral extends React.PureComponent {
	static displayName = 'ImporterGoDaddyGoCentral';

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
		} )[ 'godaddy-gocentral' ];

		return <SiteImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterGoDaddyGoCentral );

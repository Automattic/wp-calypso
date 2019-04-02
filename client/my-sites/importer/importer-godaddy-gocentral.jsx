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
import SiteImporter from './site-importer';

class ImporterGoDaddyGoCentral extends React.PureComponent {
	static displayName = 'ImporterGoDaddyGoCentral';

	importerData = {
		title: 'GoDaddy',
		icon: 'godaddy-gocentral',
		description: this.props.translate( 'Import posts, pages, and media from sites made with the GoDaddy GoCentral website builder.' ),
		uploadDescription: this.props.translate( 'Type your existing site URL to start the import.' ),
		engine: 'godaddy-gocentral',
	};

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
		return <SiteImporter importerData={ this.importerData } { ...this.props } />;
	}
}

export default localize( ImporterGoDaddyGoCentral );

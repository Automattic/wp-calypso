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
import SiteImporter from './site-importer/site-importer';

class ImporterSiteImporter extends React.PureComponent {
	static displayName = 'ImporterSiteImporter';

	importerData = {
		title: 'Site Importer (Beta)',
		icon: 'site-importer',
		description: this.props.translate( 'Import posts, pages, and media from your existing site!' ),
		uploadDescription: this.props.translate( 'Type your existing site URL to start the import.' ),
	};

	static propTypes = {
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
		return <SiteImporter importerData={ this.importerData } { ...this.props } />;
	}
}

export default localize( ImporterSiteImporter );

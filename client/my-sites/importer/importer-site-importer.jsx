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

/**
 * Module variables
 */
const importerData = {
	title: 'Site Importer (Beta)',
	icon: 'site-importer',
};

class ImporterSiteImporter extends React.PureComponent {
	static displayName = 'ImporterSiteImporter';

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
		importerData.description = this.props.translate(
			'Import posts, pages, and media from your existing site!'
		);

		importerData.uploadDescription = this.props.translate(
			'Type your existing site URL to start the import.'
		);

		return <SiteImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterSiteImporter );

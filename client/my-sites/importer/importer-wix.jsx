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

class ImporterWix extends React.PureComponent {
	static displayName = 'ImporterWix';

	importerData = {
		title: 'Wix',
		icon: 'wix',
		description: this.props.translate( 'Import posts, pages, and media from your Wix.com site.' ),
		// TODO: we could move this to the component itself. Here were trying to stick to a generalisation
		// that doesn't really apply for this importer - we don't upload anything as such.
		uploadDescription: this.props.translate( 'Type your existing site URL to start the import.' ),
		engine: 'wix',
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

export default localize( ImporterWix );

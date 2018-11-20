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

class Importer6 extends React.PureComponent {
	static displayName = 'Importer6';

	importerData = {
		title: 'Importer 6',
		icon: '',
		description: 'https://wp.me/p3Ex-3oP', // this.props.translate( 'Import posts, pages, and media from your site.' ),
		uploadDescription: this.props.translate( 'Type your existing site URL to start the import.' ),
		engine: 'engine6',
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

export default localize( Importer6 );

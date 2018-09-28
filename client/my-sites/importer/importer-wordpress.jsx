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
import FileImporter from './file-importer';
import InlineSupportLink from 'components/inline-support-link';

/**
 * Module variables
 */
const importerData = {
	title: 'WordPress',
	icon: 'wordpress',
};

class ImporterWordPress extends React.PureComponent {
	static displayName = 'ImporterWordPress';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		importerData.description = this.props.translate(
			'Import posts, pages, and media ' + 'from a WordPress export\u00A0file.'
		);

		importerData.uploadDescription = this.props.translate(
			'Upload a {{b}}WordPress export file{{/b}} to start ' +
				'importing into {{b2}}%(title)s{{/b2}}. Check out our ' +
				'{{inlineSupportLink/}} if you need ' +
				'help exporting the file.',
			{
				args: { title: this.props.site.title },
				components: {
					b: <strong />,
					b2: <strong />,
					inlineSupportLink: (
						<InlineSupportLink
							supportPostId={ 2087 }
							supportLink={ 'https://en.support.wordpress.com/export/' }
							text={ this.props.translate( 'WordPress export guide' ) }
							showIcon={ false }
						/>
					),
				},
			}
		);

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterWordPress );

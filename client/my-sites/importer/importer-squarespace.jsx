/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';
import InlineSupportLink from 'components/inline-support-link';

const importerName = 'Squarespace';

class ImporterSquarespace extends React.PureComponent {
	static displayName = 'ImporterSquarespace';

	static propTypes = {
		site: PropTypes.shape( {
			title: PropTypes.string.isRequired,
		} ).isRequired,
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
		const importerData = {
			title: importerName,
			icon: 'squarespace',
			description: this.props.translate(
				'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
				{
					args: {
						importerName,
					},
				}
			),
			uploadDescription: this.props.translate(
				'Upload a {{b}}%(importerName)s export file{{/b}} ' +
					'to start importing into {{b}}%(siteTitle)s{{/b}}. ' +
					'A %(importerName)s export file is an XML file ' +
					'containing your page and post content. ' +
					'Need help {{inlineSupportLink/}}?',
				{
					args: {
						importerName,
						siteTitle: this.props.site.title,
					},
					components: {
						b: <strong />,
						inlineSupportLink: (
							<InlineSupportLink
								supportPostId={ 87696 }
								supportLink={ 'https://en.support.wordpress.com/import/import-from-squarespace' }
								text={ this.props.translate( 'exporting your content', {
									args: {
										importerName,
									},
								} ) }
								showIcon={ false }
							/>
						),
					},
				}
			),
		};
		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterSquarespace );

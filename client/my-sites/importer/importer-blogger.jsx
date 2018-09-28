/** @format */

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

const importerName = 'Blogger.com';

class ImporterBlogger extends React.PureComponent {
	static displayName = 'ImporterBlogger';

	static propTypes = {
		site: PropTypes.shape( {
			title: PropTypes.string.isRequired,
		} ).isRequired,
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
		const importerData = {
			title: importerName,
			icon: 'blogger-alt',
			description: this.props.translate(
				'Import posts, pages, comments, tags, and images from a %(importerName)s export file.',
				{
					args: {
						importerName,
					},
				}
			),
			uploadDescription: this.props.translate(
				'To import content from a %(importerName)s site to ' +
					'{{b}}%(siteTitle)s{{/b}}, upload your ' +
					'{{b}}%(importerName)s export file{{/b}} here. ' +
					"Don't have one, or don't know where to find one? " +
					'Get step by step instructions in our {{inlineSupportLink/}}.',
				{
					args: {
						importerName,
						siteTitle: this.props.site.title,
					},
					components: {
						b: <strong />,
						inlineSupportLink: (
							<InlineSupportLink
								supportPostId={ 66764 }
								supportLink={
									'https://en.support.wordpress.com/import/coming-from-blogger/#import'
								}
								text={ this.props.translate( '%(importerName)s import guide', {
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

export default localize( ImporterBlogger );

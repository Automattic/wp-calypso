/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, flow, includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';
import FormButton from 'components/forms/form-button';
import TextInput from 'components/forms/form-text-input';
import { jpTestSubmitUrl } from 'state/jetpack-importer-test/actions';

import FileUploader from '../file-uploader';

class MediumService extends Component {
	getDescription = () =>
		this.props.translate(
			'To import content from a %(importerName)s site to ' +
				'{{b}}%(siteTitle)s{{/b}}, upload your ' +
				'{{b}}%(importerName)s export file{{/b}} here. ' +
				"Don't have one, or don't know where to find one? " +
				'Get step by step instructions in our {{inlineSupportLink/}}.',
			{
				args: {
					importerName: 'Medium',
					siteTitle: this.props.site.title,
				},
				components: {
					b: <strong />,
					inlineSupportLink: (
						<InlineSupportLink
							supportPostId={ 93180 }
							supportLink={ 'https://en.support.wordpress.com/import/import-from-medium/' }
							text={ this.props.translate( '%(importerName)s import guide', {
								args: {
									importerName: 'Medium',
								},
							} ) }
							showIcon={ false }
						/>
					),
				},
			}
		);

	render() {
		const { jetpackImporterTest: { requesting = false, detectedService = null } = {} } = this.props;

		return (
			<div className="site-importer__site-importer-pane">
				<SocialLogo className="importer__service-icon" icon="medium" size={ 48 } />
				<h4>Medium</h4>
				<p>It Looks like your site is a medium.com site...</p>
				<p>{ this.getDescription() }</p>
				<FileUploader />
			</div>
		);
	}
}

export default flow(
	connect( state => ( {
		jetpackImporterTest: get( state, 'jetpackImporterTest' ),
	} ) ),
	localize
)( MediumService );

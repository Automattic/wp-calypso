/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { localize } from 'i18n-calypso';
import { getSelectedSite } from 'state/ui/selectors';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import EmptyContent from 'components/empty-content';
import ImporterUrlInput from 'my-sites/site-settings/settings-import/url-importer';
import ServiceDetails from 'my-sites/site-settings/settings-import/service-details';
import DropZone from 'components/drop-zone';

import { startOver } from 'state/jetpack-importer-test/actions';

class JetpackImporter extends PureComponent {
	renderUnsupportedCard = () => {
		const { site, translate } = this.props;
		const {
			options: { admin_url: adminUrl },
			slug,
			title: siteTitle,
		} = site;

		const title = siteTitle.length ? siteTitle : slug;

		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-jetpack.svg"
				title={ translate( 'Want to import into your site?' ) }
				line={ translate( "Visit your site's wp-admin for all your import and export needs." ) }
				action={ translate( 'Import into %(title)s', { args: { title } } ) }
				actionURL={ adminUrl + 'import.php' }
				actionTarget="_blank"
			/>
		);
	};
	render() {
		const { jetpackImporterTest: { requesting = false, detectedService = null } = {} } = this.props;

		if ( ! isEnabled( 'manage/import-to-jetpack' ) ) {
			return this.renderUnsupportedCard();
		}

		return (
			<div>
				<CompactCard>
					<h2>
						A8C NOTICE: Jetpack Importing is currently in development -- please use wp-admin /
						wp-cli tooling in the meantime
					</h2>
					<hr />
					<div>
						{ detectedService && detectedService !== 'unsupported' ? (
							<ServiceDetails />
						) : (
							<div style={ { position: 'relative' } }>
								<ImporterUrlInput />
								<p>Or Upload a file by dragging or clicking here</p>
								<DropZone onFilesDrop={ () => {} } />
							</div>
						) }
					</div>
					<hr />
					<div>@TODO Info / Icons for supported services here</div>
				</CompactCard>
				<Button style={ { marginTop: '20px' } } onClick={ this.props.startOver }>
					Start Over
				</Button>
			</div>
		);
	}
}

export default connect(
	state => ( {
		site: getSelectedSite( state ),
		jetpackImporterTest: get( state, 'jetpackImporterTest' ),
	} ),
	{ startOver }
)( localize( JetpackImporter ) );

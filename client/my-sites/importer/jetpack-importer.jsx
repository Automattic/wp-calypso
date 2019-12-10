/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { localize } from 'i18n-calypso';
import { getSelectedSite } from 'state/ui/selectors';
import { CompactCard } from '@automattic/components';
import EmptyContent from 'components/empty-content';

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
		if ( ! isEnabled( 'manage/import-to-jetpack' ) ) {
			return this.renderUnsupportedCard();
		}

		return (
			<CompactCard>
				<h2>
					A8C NOTICE: Jetpack Importing is currently in development -- please use wp-admin / wp-cli
					tooling in the meantime
				</h2>
				<hr />
				{ '<JetpackFileImporter /> would go here' }
				<hr />
				<div>@TODO URL Importer here</div>
				<hr />
				<div>@TODO Info / Icons for supported services here</div>
			</CompactCard>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( localize( JetpackImporter ) );

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getSelectedSite } from 'state/ui/selectors';
import EmptyContent from 'components/empty-content';

class JetpackImporter extends PureComponent {
	render() {
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
	}
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( JetpackImporter ) );

import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { getSelectedSite } from 'calypso/state/ui/selectors';

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

import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resetImport } from 'calypso/state/imports/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ImporterActionButton from './action-button';

export class DoneButton extends PureComponent {
	static displayName = 'DoneButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	handleClick = () => {
		const {
			importerStatus: { type },
			site: { ID: siteId },
			siteSlug,
		} = this.props;

		this.props.recordTracksEvent( 'calypso_importer_main_done_clicked', {
			blog_id: siteId,
			importer_id: type,
			action: 'view-site',
		} );

		const destination = '/view/' + ( siteSlug || '' );
		page( destination );
	};

	componentWillUnmount() {
		const {
			importerStatus: { importerId },
			site: { ID: siteId },
		} = this.props;

		/**
		 * Calling `resetImport` in unmount defers until the redirect is in progress
		 * Otherwise, you see the importers list during the route change
		 */
		this.props.resetImport( siteId, importerId );
	}

	render() {
		const { translate } = this.props;

		return (
			<ImporterActionButton primary onClick={ this.handleClick }>
				{ translate( 'View site' ) }
			</ImporterActionButton>
		);
	}
}

export default connect(
	( state ) => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ recordTracksEvent, resetImport }
)( localize( DoneButton ) );

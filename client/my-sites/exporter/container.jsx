import { Component } from 'react';
import { connect } from 'react-redux';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ExportCard from './export-card';
import ExportMediaCard from './export-media-card';
import Notices from './notices';

class ExporterContainer extends Component {
	render() {
		const { siteId, isJetpack } = this.props;

		return (
			<div className="exporter">
				<Notices />
				<ExportCard key={ siteId } siteId={ siteId } />
				{ ! isJetpack && <ExportMediaCard siteId={ siteId } /> }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	siteId: getSelectedSiteId( state ),
	isJetpack: isJetpackSite( state, siteId ),
} );

export default connect( mapStateToProps )( ExporterContainer );

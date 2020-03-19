/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { requestActivityLogs } from 'state/data-getters';
import { emptyFilter } from 'state/activity-log/reducer';
import { withLocalizedMoment } from 'components/localized-moment';
import Gridicon from 'components/gridicon';
import FoldableCard from 'components/foldable-card';
import { Button } from '@automattic/components';

class BackupDetailPage extends Component {
	render() {
		const { backupId, logs, moment, siteId, translate } = this.props;

		const thisBackup = logs.filter( event => event.rewindId === backupId );
		const meta = thisBackup[ 0 ] && thisBackup[ 0 ].activityDescription[ 2 ].children[ 0 ];

		const metaList =
			meta &&
			meta.split( ', ' ).map( item => {
				return <li key={ item }>{ item }</li>;
			} );

		return (
			<Main>
				<DocumentHead title="Backup Details" />
				<SidebarNavigation />
				<div>
					<Gridicon icon="cloud-upload" />
					{ moment( thisBackup.activityDate ).format( 'YYYY-MM-DD' ) }
				</div>
				<div>
					<Button primary={ false }>{ translate( 'Download backup' ) }</Button>
					<Button primary={ true }>{ translate( 'Restore to this point' ) }</Button>
				</div>
				<FoldableCard header={ translate( 'Total # of files backed up' ) }>
					<ul>{ metaList }</ul>
				</FoldableCard>
				<div>{ translate( 'Backup details' ) }</div>
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const logs = siteId && requestActivityLogs( siteId, emptyFilter );

	return {
		logs: logs?.data ?? [],
		siteId,
	};
} )( localize( withLocalizedMoment( BackupDetailPage ) ) );

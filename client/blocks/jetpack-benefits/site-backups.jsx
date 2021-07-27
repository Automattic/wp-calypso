/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';

class JetpackBenefitsSiteBackups extends React.Component {
	getBackupTimeAgo( backup ) {
		if ( backup ) {
			return moment.utc( backup.last_updated ).fromNow();
		}

		return '...';
	}

	getPostCountForBackup( backup ) {
		if ( backup ) {
			const stats = backup.stats;
			return (
				stats.tables[ stats.prefix + 'posts' ].post_published ??
				stats.tables[ stats.prefix + 'posts' ].published
			);
		}

		return '...';
	}

	getStatForBackup( backup, statName ) {
		if ( backup ) {
			const stats = backup.stats;
			return stats[ statName ] ? stats[ statName ].count : 0;
		}

		return '...';
	}

	getLastSuccessfulBackup() {
		let { backups } = this.props;

		if ( ! backups || ! Array.isArray( backups ) ) {
			backups = [];
		}

		const lastSuccessful = backups.find( ( backup ) => {
			return backup.status === 'finished';
		} );

		return lastSuccessful ?? null;
	}

	render() {
		// if this is a standalone backup solution, show some more detailed information about the last backup taken
		const { isStandalone, siteId } = this.props;
		// TODO: account for case where no successful backups have been taken yet
		const lastSuccessfulBackup = this.getLastSuccessfulBackup();
		const lastBackupTimeAgo = this.getBackupTimeAgo( lastSuccessfulBackup );

		if ( isStandalone ) {
			return (
				<React.Fragment>
					<QueryRewindBackups siteId={ siteId } />
					<JetpackBenefitsStandaloneCard
						title="Backups"
						summary={ {
							title: 'Last Backup',
							stat: lastBackupTimeAgo,
						} }
						stats={ [
							{
								title: 'Posts',
								stat: this.getPostCountForBackup( lastSuccessfulBackup ),
							},
							{
								title: 'Uploads',
								stat: this.getStatForBackup( lastSuccessfulBackup, 'uploads' ),
							},
							{
								title: 'Plugins',
								stat: this.getStatForBackup( lastSuccessfulBackup, 'plugins' ),
							},
						] }
					/>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<QueryRewindBackups siteId={ siteId } />
				<JetpackBenefitsCard
					headline="Site Backups"
					description="Your latest site backups."
					stat={ lastBackupTimeAgo }
				/>
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	return {
		backups: getRewindBackups( state, siteId ),
	};
}, {} )( localize( JetpackBenefitsSiteBackups ) );

import page from '@automattic/calypso-router';
import { Button, Card, CompactCard, ProgressBar, Gridicon, Spinner } from '@automattic/components';
import { isEmpty } from '@automattic/js-utils';
import { getLocaleSlug, localize } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { Interval, EVERY_TEN_SECONDS } from 'calypso/lib/interval';
import wpcom from 'calypso/lib/wp';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { updateSiteMigrationMeta, requestSite } from 'calypso/state/sites/actions';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { MigrationInProgress } from './components/migration-in-progress';
import { goToMigrationFlow } from './utils';

import './section-migrate.scss';

export class SectionMigrate extends Component {
	state = {
		errorMessage: '',
		migrationStatus: 'unknown',
		migrationErrorStatus: null,
		percent: 0,
		backupPercent: 0,
		restorePercent: 0,
		restoreMessage: '',
		backupPosts: 0,
		backupMedia: 0,
		siteSize: 0,
		startTime: '',
		stage: 0,
		stageTotal: 0,
	};

	componentDidMount() {
		if ( this.isNonAtomicJetpack() ) {
			return page( `/import/${ this.props.targetSiteSlug }` );
		}

		this.updateFromAPI();
	}

	/* eslint-disable no-unused-vars */
	componentDidUpdate( prevProps, prevState ) {
		if ( this.isNonAtomicJetpack() ) {
			return page( `/import/${ this.props.targetSiteSlug }` );
		}

		if ( this.props.targetSiteId !== prevProps.targetSiteId ) {
			this.updateFromAPI();
		}

		if ( 'done' === this.state.migrationStatus && prevState.migrationStatus !== 'done' ) {
			this.finishMigration();
		}

		// New migrations start in the site migration flow.
		if ( 'inactive' === this.state.migrationStatus && prevState.migrationStatus !== 'inactive' ) {
			goToMigrationFlow( this.props.targetSiteSlug );
		}
	}

	requestMigrationReset = async ( targetSiteId ) => {
		await wpcom.req
			.post( {
				path: `/sites/${ targetSiteId }/reset-migration`,
				apiNamespace: 'wpcom/v2',
			} )
			.catch( () => {} );
	};

	finishMigration = () => {
		const { targetSiteId, targetSiteSlug } = this.props;

		/**
		 * Request another update after the migration is finished to
		 * update the site title and other info that may have changed.
		 */
		this.props.requestSite( targetSiteId );

		this.requestMigrationReset( targetSiteId ).finally( () => {
			page( `/home/${ targetSiteSlug }` );
		} );
	};

	resetMigration = () => {
		const { targetSiteId, targetSiteSlug } = this.props;

		this.requestMigrationReset( targetSiteId ).finally( () => {
			page( `/migrate/${ targetSiteSlug }` );
			/**
			 * Note this migrationStatus is local, thus the setState vs setMigrationState.
			 * Call to updateFromAPI will update both local and non-local state.
			 */
			this.setState(
				{
					migrationStatus: 'inactive',
					errorMessage: '',
				},
				this.updateFromAPI
			);
		} );
	};

	setMigrationState = ( state ) => {
		// A response from the status endpoint may come in after the
		// migrate/from endpoint has returned an error. This avoids that
		// response accidentally clearing the error state.
		if ( 'error' === this.state.migrationStatus ) {
			return;
		}

		if ( state.migrationStatus ) {
			this.props.updateSiteMigrationMeta(
				this.props.targetSiteId,
				state.migrationStatus,
				state.migrationErrorStatus,
				state.lastModified
			);
		}

		this.setState( state );
	};

	setSourceSiteId = ( sourceSiteId ) => {
		this.props.navigateToSelectedSourceSite( sourceSiteId );
	};

	updateFromAPI = () => {
		const { targetSiteId, targetSite } = this.props;
		wpcom.req
			.get( {
				path: `/sites/${ targetSiteId }/migration-status`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( response ) => {
				const {
					status: migrationStatus,
					error_status: migrationErrorStatus,
					percent,
					backup_percent: backupPercent,
					restore_percent: restorePercent,
					restore_message: restoreMessage,
					site_size: siteSize,
					posts_count: backupPosts,
					uploads_count: backupMedia,
					source_blog_id: sourceSiteId,
					created: startTime,
					last_modified: lastModified,
					is_atomic: isBackendAtomic,
					step,
					step_name: stepName,
					total_steps: stepTotal,
				} = response;

				if ( String( sourceSiteId ) !== String( this.props.sourceSiteId ) ) {
					sourceSiteId && this.setSourceSiteId( sourceSiteId );
				}

				if ( migrationStatus ) {
					const newState = {
						migrationStatus,
						migrationErrorStatus,
						percent,
						backupPercent,
						restorePercent,
						restoreMessage,
						siteSize,
						backupPosts,
						backupMedia,
						lastModified,
						step,
						stepName,
						stepTotal,
					};

					if ( startTime && isEmpty( this.state.startTime ) ) {
						const startMoment = moment.utc( startTime, 'YYYY-MM-DD HH:mm:ss' );

						if ( ! startMoment.isValid() ) {
							this.setMigrationState( newState );

							return;
						}

						const localizedStartTime = startMoment
							.local()
							.locale( getLocaleSlug() )
							.format( 'lll' );

						newState.startTime = localizedStartTime;
						this.setMigrationState( newState );

						return;
					}

					/**
					 * Renew the site if the backend upgraded do Atomic, but Calypso still has old data
					 */
					if ( isBackendAtomic && ! ( targetSite?.options?.is_wpcom_atomic ?? false ) ) {
						this.props.requestSite( targetSiteId );
					}

					this.setMigrationState( newState );
				}
			} )
			.catch( ( error ) => {
				const { message = '' } = error;
				this.setMigrationState( {
					migrationStatus: 'error',
					errorMessage: message,
				} );
			} );
	};

	isInProgress = () => {
		return [ 'new', 'backing-up', 'restoring' ].includes( this.state.migrationStatus );
	};

	isFinished = () => {
		return [ 'done', 'error', 'unknown' ].includes( this.state.migrationStatus );
	};

	isNonAtomicJetpack = () => {
		return ! this.props.isTargetSiteAtomic && this.props.isTargetSiteJetpack;
	};

	renderLoading() {
		const { translate } = this.props;

		return (
			<CompactCard>
				<span className="migrate__placeholder">{ translate( 'Loading…' ) }</span>
			</CompactCard>
		);
	}

	renderMigrationComplete() {
		const { targetSite, translate } = this.props;
		const viewSiteURL = targetSite?.URL;

		return (
			<>
				<FormattedHeader
					className="migrate__section-header"
					headerText={ translate( 'Congratulations!' ) }
					align="left"
				/>
				<CompactCard>
					<div className="migrate__status">
						{ translate( 'Your import has completed successfully.' ) }
					</div>
					<Button primary href={ viewSiteURL }>
						{ translate( 'View site' ) }
					</Button>
					<Button onClick={ this.resetMigration }>Start over</Button>
				</CompactCard>
			</>
		);
	}

	renderMigrationError() {
		const { translate } = this.props;

		return (
			<Card className="migrate__pane migrate__error">
				<FormattedHeader
					className="migrate__section-header"
					headerText={ translate( 'Import failed' ) }
					align="center"
				/>
				<div className="migrate__status">
					{ translate( 'There was an error with your import.' ) }
					<br />
					{ this.state.errorMessage }

					<p className="migrate__info">
						{ translate(
							'{{supportLink}}Contact us{{/supportLink}} so we can' +
								' figure out exactly' +
								' what needs adjusting, or try again.',
							{
								components: {
									supportLink: (
										<a
											href="https://wordpress.com/help/contact"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</div>
				<Button primary onClick={ this.resetMigration }>
					{ translate( 'Try again' ) }
				</Button>
			</Card>
		);
	}

	renderMigrationProgress() {
		const { sourceSite, targetSite, translate } = this.props;
		const sourceSiteDomain = sourceSite?.domain;
		const targetSiteDomain = targetSite?.domain;
		const subHeaderText = (
			<>
				{ translate(
					"We're moving everything from {{sp}}%(sourceSiteDomain)s{{/sp}} to {{sp}}%(targetSiteDomain)s{{/sp}}.",
					{
						args: {
							sourceSiteDomain,
							targetSiteDomain,
						},
						components: {
							sp: <span className="migrate__domain" />,
						},
					}
				) }
			</>
		);

		return (
			<>
				<Interval onTick={ this.updateFromAPI } period={ EVERY_TEN_SECONDS } />
				<Card className="migrate__pane">
					<img
						className="migrate__illustration"
						src="/calypso/images/illustrations/waitTime-plain.svg"
						alt=""
					/>
					<FormattedHeader
						className="migrate__section-header"
						headerText={ translate( 'Import in progress' ) }
						subHeaderText={ subHeaderText }
						align="center"
					/>
					{ this.renderStartTime() }
					{ this.renderProgressBar() }
					{ this.renderProgressList() }
					<p className="migrate__note">
						{ translate(
							"You can safely navigate away from this page if you need to; we'll send you a notification when it's done."
						) }
					</p>
				</Card>
			</>
		);
	}

	renderStartTime() {
		const { translate } = this.props;

		if ( isEmpty( this.state.startTime ) ) {
			return <div className="migrate__start-time">&nbsp;</div>;
		}

		return (
			<div className="migrate__start-time">
				{ translate( 'Import started' ) } { this.state.startTime }
			</div>
		);
	}

	renderProgressBar() {
		if ( this.isInProgress() ) {
			return (
				<ProgressBar isPulsing className="migrate__progress" value={ this.state.percent || 0 } />
			);
		}

		if ( this.isFinished() ) {
			return <ProgressBar className="migrate__progress is-complete" value={ 100 } />;
		}
	}

	renderProgressIcon( progressState ) {
		const { migrationStatus } = this.state;

		if ( progressState === migrationStatus ) {
			return <Spinner />;
		}

		if ( 'backing-up' === progressState ) {
			if ( 'new' === migrationStatus ) {
				return <Spinner />;
			}
			return <Gridicon className="migrate__progress-item-icon-success" icon="checkmark-circle" />;
		}

		return (
			<img
				alt=""
				src="/calypso/images/importer/circle-gray.svg"
				className="migrate__progress-item-icon-todo"
			/>
		);
	}

	renderProgressItem( progressState ) {
		const { migrationStatus } = this.state;
		const { sourceSite, targetSite, translate } = this.props;
		const sourceSiteDomain = sourceSite?.domain;
		const targetSiteDomain = targetSite?.domain;

		let progressItemText;
		switch ( progressState ) {
			case 'backing-up':
				if ( 'backing-up' === migrationStatus || 'new' === migrationStatus ) {
					progressItemText = (
						<span>
							{ translate( 'Backing up {{sp}}%(sourceSiteDomain)s{{/sp}}', {
								args: {
									sourceSiteDomain,
								},
								components: {
									sp: <span className="migrate__domain" />,
								},
							} ) }
						</span>
					);
					break;
				}
				progressItemText = (
					<span>
						{ translate( 'Backup of {{sp}}%(sourceSiteDomain)s{{/sp}} completed', {
							args: {
								sourceSiteDomain,
							},
							components: {
								sp: <span className="migrate__domain" />,
							},
						} ) }
					</span>
				);
				break;
			case 'restoring':
				progressItemText = (
					<span>
						{ translate( 'Restoring to {{sp}}%(targetSiteDomain)s{{/sp}}', {
							args: {
								targetSiteDomain,
							},
							components: {
								sp: <span className="migrate__domain" />,
							},
						} ) }
					</span>
				);
				break;
		}

		return (
			<li key={ `progress-${ progressState }` } className="migrate__progress-item">
				<div className="migrate__progress-item-icon">
					{ this.renderProgressIcon( progressState ) }
				</div>
				<div className="migrate__progress-item-text">{ progressItemText }</div>
			</li>
		);
	}

	renderProgressList() {
		const steps = [ 'backing-up', 'restoring' ];

		return (
			<ul className="migrate__progress-list">
				{ steps.map( ( step ) => this.renderProgressItem( step ) ) }
			</ul>
		);
	}

	render() {
		const { sourceSite, targetSite, translate, targetSiteId } = this.props;

		let migrationElement;

		switch ( this.state.migrationStatus ) {
			case 'in-progress':
				return (
					<MigrationInProgress
						sourceSite={ sourceSite?.domain }
						targetSite={ targetSite?.domain }
						targetSiteId={ targetSiteId }
						onComplete={ this.finishMigration }
					/>
				);

			case 'inactive':
				return null;

			case 'new':
			case 'backing-up':
			case 'restoring':
				migrationElement = this.renderMigrationProgress();
				break;

			case 'done':
				return null;

			case 'error':
				migrationElement = this.renderMigrationError();
				break;

			case 'unknown':
			default:
				migrationElement = this.renderLoading();
		}

		return (
			<Main>
				<DocumentHead title={ translate( 'Migrate' ) } />
				{ migrationElement }
			</Main>
		);
	}
}

const navigateToSelectedSourceSite = ( sourceSiteId ) => ( dispatch, getState ) => {
	const state = getState();
	const sourceSite = getSite( state, sourceSiteId );
	const sourceSiteSlug = sourceSite?.slug ?? sourceSiteId;
	const targetSiteSlug = getSelectedSiteSlug( state );

	page( `/migrate/from/${ sourceSiteSlug }/to/${ targetSiteSlug }` );
};

export const connector = connect(
	( state, ownProps ) => {
		const targetSiteId = getSelectedSiteId( state );
		return {
			isTargetSiteAtomic: !! isSiteAutomatedTransfer( state, targetSiteId ),
			isTargetSiteJetpack: !! isJetpackSite( state, targetSiteId ),
			sourceSite: ownProps.sourceSiteId && getSite( state, ownProps.sourceSiteId ),
			targetSite: getSelectedSite( state ),
			targetSiteId,
			targetSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		navigateToSelectedSourceSite,
		updateSiteMigrationMeta,
		requestSite,
	}
);

export default connector( localize( SectionMigrate ) );

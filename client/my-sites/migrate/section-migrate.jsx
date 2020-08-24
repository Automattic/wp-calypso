/**
 * External dependencies
 */
import React, { Component } from 'react';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import { get, includes, isEmpty, omit } from 'lodash';
import moment from 'moment';
import { Button, Card, CompactCard, ProgressBar } from '@automattic/components';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Spinner from 'components/spinner';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from 'lib/plans/constants';
import { planHasFeature } from 'lib/plans';
import StepConfirmMigration from './step-confirm-migration';
import StepImportOrMigrate from './step-import-or-migrate';
import StepSourceSelect from './step-source-select';
import StepUpgrade from './step-upgrade';
import { Interval, EVERY_TEN_SECONDS } from 'lib/interval';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'state/sites/selectors';
import { receiveSite, updateSiteMigrationMeta, requestSite } from 'state/sites/actions';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { urlToSlug } from 'lib/url';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import wpcom from 'lib/wp';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './section-migrate.scss';

const THIRTY_SECONDS = 30 * 1000;

class SectionMigrate extends Component {
	_startedMigrationFromCart = false;
	_timeStartedMigrationFromCart = false;

	state = {
		errorMessage: '',
		isJetpackConnected: false,
		migrationStatus: 'unknown',
		percent: 0,
		siteInfo: null,
		selectedSiteSlug: null,
		sourceSitePlugins: [],
		sourceSiteThemes: [],
		startTime: '',
		url: '',
		chosenImportType: '',
	};

	componentDidMount() {
		if ( this.isNonAtomicJetpack() ) {
			return page( `/import/${ this.props.targetSiteSlug }` );
		}

		if ( true === this.props.startMigration ) {
			this._startedMigrationFromCart = true;
			this._timeStartedMigrationFromCart = new Date().getTime();
			this.setMigrationState( { migrationStatus: 'backing-up' } );
			this.startMigration();
		}

		this.fetchSourceSitePluginsAndThemes();
		this.updateFromAPI();
	}

	componentDidUpdate( prevProps ) {
		if ( this.isNonAtomicJetpack() ) {
			return page( `/import/${ this.props.targetSiteSlug }` );
		}

		if ( this.props.sourceSiteId !== prevProps.sourceSiteId ) {
			this.fetchSourceSitePluginsAndThemes();
		}

		if ( this.props.targetSiteId !== prevProps.targetSiteId ) {
			this.updateFromAPI();
		}

		if ( 'done' === this.state.migrationStatus ) {
			this.finishMigration();
		}
	}

	fetchSourceSitePluginsAndThemes = () => {
		if ( ! this.props.sourceSite ) {
			return;
		}

		wpcom.site( this.props.sourceSite.ID ).pluginsList( ( error, data ) => {
			if ( data.plugins ) {
				this.setState( { sourceSitePlugins: data.plugins } );
			}
		} );

		wpcom.undocumented().themes( this.props.sourceSite.ID, { apiVersion: '1' }, ( err, data ) => {
			if ( data.themes ) {
				const sourceSiteThemes = [
					// Put active theme first
					...data.themes.filter( ( theme ) => theme.active ),
					...data.themes.filter( ( theme ) => ! theme.active ),
				];
				this.setState( { sourceSiteThemes } );
			}
		} );
	};

	handleJetpackSelect = () => {
		this.props.navigateToSelectedSourceSite( this.state.selectedSiteSlug );
	};

	finishMigration = () => {
		const { targetSiteId, targetSiteSlug } = this.props;

		/**
		 * Request another update after the migration is finished to
		 * update the site title and other info that may have changed.
		 */
		this.props.requestSite( targetSiteId );

		wpcom
			.undocumented()
			.resetMigration( targetSiteId )
			.finally( () => {
				page( `/home/${ targetSiteSlug }` );
			} );
	};

	resetMigration = () => {
		const { targetSiteId, targetSiteSlug } = this.props;

		wpcom
			.undocumented()
			.resetMigration( targetSiteId )
			.finally( () => {
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

		// When we redirect from the cart, we set migrationState to 'backing-up'
		// and start migration straight away. This condition prevents a response
		// from the status endpoint accidentally changing the local state
		// before the server's properly registered that we're backing up.
		// After 30 seconds, responses from the server are no longer ignored,
		// this prevents migrations reset from the server from being locked.
		if (
			this._startedMigrationFromCart &&
			'backing-up' === this.state.migrationStatus &&
			state.migrationStatus === 'inactive' &&
			new Date().getTime() - this._timeStartedMigrationFromCart < THIRTY_SECONDS
		) {
			return;
		}

		if ( state.migrationStatus ) {
			this.props.updateSiteMigrationMeta(
				this.props.targetSiteId,
				state.migrationStatus,
				state.lastModified
			);
		}
		this.setState( state );
	};

	setSiteInfo = ( siteInfo, callback ) => {
		this.setState( { siteInfo }, () => {
			const selectedSiteSlug = urlToSlug( siteInfo.site_url.replace( /\/$/, '' ) );
			this.setState( { selectedSiteSlug } );
			wpcom
				.site( selectedSiteSlug )
				.get( {
					apiVersion: '1.2',
				} )
				.then( ( site ) => {
					if ( ! ( site && site.capabilities ) ) {
						// A site isn't connected if we cannot manage it.
						return this.setState( { isJetpackConnected: false } );
					}

					// Update the site in the state tree.
					this.props.receiveSite( omit( site, '_headers' ) );
					this.setState( { isJetpackConnected: true } );
				} )
				.catch( () => {
					// @TODO: Do we need to better handle this? It most-likely means the site isn't connected.
					this.setState( { isJetpackConnected: false } );
				} )
				.finally( callback );
		} );
	};

	setSourceSiteId = ( sourceSiteId ) => {
		this.props.navigateToSelectedSourceSite( sourceSiteId );
	};

	setUrl = ( event ) => this.setState( { url: event.target.value } );

	startMigration = () => {
		const { sourceSiteId, targetSiteId, targetSite } = this.props;

		if ( ! sourceSiteId || ! targetSiteId ) {
			return;
		}

		const planSlug = get( targetSite, 'plan.product_slug' );
		if (
			planSlug &&
			! this._startedMigrationFromCart &&
			! planHasFeature( planSlug, FEATURE_UPLOAD_THEMES_PLUGINS )
		) {
			this.goToCart();
			return;
		}

		this.setMigrationState( { migrationStatus: 'backing-up', startTime: null } );

		this.props.recordTracksEvent( 'calypso_site_migration_start_migration' );

		wpcom
			.undocumented()
			.startMigration( sourceSiteId, targetSiteId )
			.then( () => this.updateFromAPI() )
			.catch( ( error ) => {
				const { code = '', message = '' } = error;

				if ( 'no_supported_plan' === code ) {
					this.goToCart();
					return;
				}

				this.setMigrationState( {
					migrationStatus: 'error',
					errorMessage: message,
				} );
			} );
	};

	goToCart = () => {
		const { sourceSite, targetSiteSlug } = this.props;
		const sourceSiteSlug = get( sourceSite, 'slug' );

		page(
			`/checkout/${ targetSiteSlug }/business?redirect_to=/migrate/from/${ sourceSiteSlug }/to/${ targetSiteSlug }%3Fstart%3Dtrue`
		);
	};

	updateFromAPI = () => {
		const { targetSiteId, targetSite } = this.props;
		wpcom
			.undocumented()
			.getMigrationStatus( targetSiteId )
			.then( ( response ) => {
				const {
					status: migrationStatus,
					percent,
					source_blog_id: sourceSiteId,
					created: startTime,
					last_modified: lastModified,
					is_atomic: isBackendAtomic,
				} = response;

				if ( sourceSiteId && sourceSiteId !== this.props.sourceSiteId ) {
					this.setSourceSiteId( sourceSiteId );
				}

				if ( migrationStatus ) {
					if ( startTime && isEmpty( this.state.startTime ) ) {
						const startMoment = moment.utc( startTime, 'YYYY-MM-DD HH:mm:ss' );

						if ( ! startMoment.isValid() ) {
							this.setMigrationState( {
								migrationStatus,
								percent,
								lastModified,
							} );
							return;
						}

						const localizedStartTime = startMoment
							.local()
							.locale( getLocaleSlug() )
							.format( 'lll' );

						this.setMigrationState( {
							migrationStatus,
							percent,
							startTime: localizedStartTime,
							lastModified,
						} );
						return;
					}

					/**
					 * Renew the site if the backend upgraded do Atomic, but Calypso still has old data
					 */
					if ( isBackendAtomic && ! get( targetSite, 'options.is_wpcom_atomic', false ) ) {
						this.props.requestSite( targetSiteId );
					}

					this.setMigrationState( {
						migrationStatus,
						percent,
						lastModified,
					} );
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
		return includes( [ 'new', 'backing-up', 'restoring' ], this.state.migrationStatus );
	};

	isFinished = () => {
		return includes( [ 'done', 'error', 'unknown' ], this.state.migrationStatus );
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
		const viewSiteURL = get( targetSite, 'URL' );

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
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );
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
						src={ '/calypso/images/illustrations/waitTime-plain.svg' }
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
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );

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
		const { step, sourceSite, targetSite, targetSiteSlug, translate } = this.props;
		const sourceSiteSlug = get( sourceSite, 'slug' );

		let migrationElement;

		switch ( this.state.migrationStatus ) {
			case 'inactive':
				switch ( step ) {
					case 'confirm':
						migrationElement = (
							<StepConfirmMigration
								sourceSite={ sourceSite }
								startMigration={ this.startMigration }
								targetSite={ targetSite }
								targetSiteSlug={ targetSiteSlug }
							/>
						);
						break;
					case 'migrateOrImport':
						migrationElement = (
							<StepImportOrMigrate
								onJetpackSelect={ this.handleJetpackSelect }
								sourceSiteInfo={ this.state.siteInfo }
								targetSite={ targetSite }
								targetSiteSlug={ targetSiteSlug }
								sourceHasJetpack={ this.state.isJetpackConnected }
								isTargetSiteAtomic={ this.props.isTargetSiteAtomic }
							/>
						);
						break;
					case 'upgrade':
						migrationElement = (
							<StepUpgrade
								plugins={ this.state.sourceSitePlugins }
								sourceSite={ sourceSite }
								sourceSiteSlug={ sourceSiteSlug }
								startMigration={ this.startMigration }
								targetSite={ targetSite }
								targetSiteSlug={ targetSiteSlug }
								themes={ this.state.sourceSiteThemes }
							/>
						);
						break;
					case 'input':
					default:
						migrationElement = (
							<StepSourceSelect
								onSiteInfoReceived={ this.setSiteInfo }
								onUrlChange={ this.setUrl }
								targetSite={ targetSite }
								targetSiteSlug={ targetSiteSlug }
								url={ this.state.url }
							/>
						);
						break;
				}
				break;

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
				<SidebarNavigation />
				{ migrationElement }
			</Main>
		);
	}
}

const navigateToSelectedSourceSite = ( sourceSiteId ) => ( dispatch, getState ) => {
	const state = getState();
	const sourceSite = getSite( state, sourceSiteId );
	const sourceSiteSlug = get( sourceSite, 'slug', sourceSiteId );
	const targetSiteSlug = getSelectedSiteSlug( state );

	page( `/migrate/from/${ sourceSiteSlug }/to/${ targetSiteSlug }` );
};

export default connect(
	( state, ownProps ) => {
		const targetSiteId = getSelectedSiteId( state );
		return {
			isTargetSiteAtomic: !! isSiteAutomatedTransfer( state, targetSiteId ),
			isTargetSiteJetpack: !! isJetpackSite( state, targetSiteId ),
			sourceSite: ownProps.sourceSiteId && getSite( state, ownProps.sourceSiteId ),
			startMigration: !! get( getCurrentQueryArguments( state ), 'start', false ),
			sourceSiteHasJetpack: false,
			targetSite: getSelectedSite( state ),
			targetSiteId,
			targetSiteImportAdminUrl: getSiteAdminUrl( state, targetSiteId, 'import.php' ),
			targetSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		navigateToSelectedSourceSite,
		receiveSite,
		updateSiteMigrationMeta,
		requestSite,
		recordTracksEvent,
	}
)( localize( SectionMigrate ) );

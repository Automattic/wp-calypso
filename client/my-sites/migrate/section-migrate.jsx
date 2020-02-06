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
import { receiveSite, updateSiteMigrationStatus } from 'state/sites/actions';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { urlToSlug } from 'lib/url';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class SectionMigrate extends Component {
	_startedMigrationFromCart = false;

	state = {
		errorMessage: '',
		isJetpackConnected: false,
		migrationStatus: 'unknown',
		percent: 0,
		siteInfo: null,
		selectedSiteSlug: null,
		startTime: '',
		url: '',
		chosenImportType: '',
	};

	componentDidMount() {
		if ( true === this.props.startMigration ) {
			this._startedMigrationFromCart = true;
			this.setMigrationState( { migrationStatus: 'backing-up' } );
			this.startMigration();
		}

		this.updateFromAPI();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.targetSiteId !== prevProps.targetSiteId ) {
			this.updateFromAPI();
		}
	}

	getImportHref = () => {
		const { isTargetSiteJetpack, targetSiteImportAdminUrl, targetSiteSlug } = this.props;

		return isTargetSiteJetpack ? targetSiteImportAdminUrl : `/import/${ targetSiteSlug }`;
	};

	handleJetpackSelect = () => {
		this.props.navigateToSelectedSourceSite( this.state.selectedSiteSlug );
	};

	jetpackSiteFilter = sourceSite => {
		const { targetSiteId } = this.props;

		return sourceSite.jetpack && sourceSite.ID !== targetSiteId;
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

	setMigrationState = state => {
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
		if (
			this._startedMigrationFromCart &&
			'backing-up' === this.state.migrationStatus &&
			state.migrationStatus === 'inactive'
		) {
			return;
		}

		if ( state.migrationStatus ) {
			this.props.updateSiteMigrationStatus( this.props.targetSiteId, state.migrationStatus );
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
				.then( site => {
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

	setSourceSiteId = sourceSiteId => {
		this.props.navigateToSelectedSourceSite( sourceSiteId );
	};

	setUrl = event => this.setState( { url: event.target.value } );

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

		this.setMigrationState( { migrationStatus: 'backing-up' } );

		wpcom
			.undocumented()
			.startMigration( sourceSiteId, targetSiteId )
			.then( () => this.updateFromAPI() )
			.catch( error => {
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
		const { targetSiteId } = this.props;
		wpcom
			.undocumented()
			.getMigrationStatus( targetSiteId )
			.then( response => {
				const {
					status: migrationStatus,
					percent,
					source_blog_id: sourceSiteId,
					created: startTime,
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
						} );
						return;
					}

					this.setMigrationState( {
						migrationStatus,
						percent,
					} );
				}
			} )
			.catch( error => {
				const { message = '' } = error;
				this.setMigrationState( {
					migrationStatus: 'error',
					errorMessage: message,
				} );
			} );
	};

	isInProgress = () => {
		return includes( [ 'backing-up', 'restoring' ], this.state.migrationStatus );
	};

	isFinished = () => {
		return includes( [ 'done', 'error', 'unknown' ], this.state.migrationStatus );
	};

	renderLoading() {
		return (
			<CompactCard>
				<span className="migrate__placeholder">Loading...</span>
			</CompactCard>
		);
	}

	renderMigrationComplete() {
		const { targetSite } = this.props;
		const viewSiteURL = get( targetSite, 'URL' );

		return (
			<>
				<FormattedHeader
					className="migrate__section-header"
					headerText="Congratulations!"
					align="left"
				/>
				<CompactCard>
					<div className="migrate__status">Your import has completed successfully.</div>
					<Button primary href={ viewSiteURL }>
						View site
					</Button>
					<Button onClick={ this.resetMigration }>Start over</Button>
				</CompactCard>
			</>
		);
	}

	renderMigrationConfirmation() {}

	renderMigrationError() {
		return (
			<Card className="migrate__pane">
				<FormattedHeader
					className="migrate__section-header"
					headerText="Import failed"
					align="center"
				/>
				<div className="migrate__status">
					There was an error with your import.
					<br />
					{ this.state.errorMessage }
				</div>
				<Button primary onClick={ this.resetMigration }>
					Back to your site
				</Button>
			</Card>
		);
	}

	renderMigrationProgress() {
		const { sourceSite, targetSite } = this.props;
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );
		const subHeaderText = (
			<>
				{ "We're moving everything from " }
				<span className="migrate__domain">{ sourceSiteDomain }</span>
				{ ' to ' }
				<span className="migrate__domain">{ targetSiteDomain }</span>.
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
						headerText="Import in progress"
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
		if ( isEmpty( this.state.startTime ) ) {
			return <div className="migrate__start-time">&nbsp;</div>;
		}

		return <div className="migrate__start-time">Import started { this.state.startTime }</div>;
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
		const { sourceSite, targetSite } = this.props;
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );

		let progressItemText;
		switch ( progressState ) {
			case 'backing-up':
				progressItemText = (
					<span>
						Backed up from <span className="migrate__domain">{ sourceSiteDomain }</span>
					</span>
				);
				if ( migrationStatus === 'backing-up' ) {
					progressItemText = (
						<span>
							Backing up from <span className="migrate__domain">{ sourceSiteDomain }</span>
						</span>
					);
				}
				break;
			case 'restoring':
				progressItemText = (
					<span>
						Restoring to <span className="migrate__domain">{ targetSiteDomain }</span>
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
				{ steps.map( step => this.renderProgressItem( step ) ) }
			</ul>
		);
	}

	render() {
		const { step, sourceSite, targetSite, targetSiteSlug } = this.props;

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
							<StepUpgrade startMigration={ this.startMigration } targetSite={ targetSite } />
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
				migrationElement = this.renderMigrationComplete();
				break;

			case 'error':
				migrationElement = this.renderMigrationError();
				break;

			case 'unknown':
			default:
				migrationElement = this.renderLoading();
		}

		return (
			<Main>
				<DocumentHead title="Migrate" />
				<SidebarNavigation />
				{ migrationElement }
			</Main>
		);
	}
}

const navigateToSelectedSourceSite = sourceSiteId => ( dispatch, getState ) => {
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
	{ navigateToSelectedSourceSite, receiveSite, updateSiteMigrationStatus }
)( localize( SectionMigrate ) );

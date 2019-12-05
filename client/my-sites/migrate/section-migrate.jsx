/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import { get, isEmpty, includes } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button, Card, CompactCard, ProgressBar } from '@automattic/components';
import CardHeading from 'components/card-heading';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Site from 'blocks/site';
import SiteSelector from 'components/site-selector';
import Spinner from 'components/spinner';
import { Interval, EVERY_TEN_SECONDS } from 'lib/interval';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import wpLib from 'lib/wp';

/**
 * Style dependencies
 */
import './section-migrate.scss';

const wpcom = wpLib.undocumented();

class SectionMigrate extends Component {
	state = {
		migrationStatus: 'unknown',
		percent: 0,
		startTime: '',
	};

	componentDidMount() {
		this.updateFromAPI();
	}

	getImportHref = () => {
		const { isTargetSiteJetpack, targetSiteImportAdminUrl, targetSiteSlug } = this.props;

		return isTargetSiteJetpack ? targetSiteImportAdminUrl : `/import/${ targetSiteSlug }`;
	};

	jetpackSiteFilter = sourceSite => {
		const { targetSiteId } = this.props;

		return sourceSite.jetpack && sourceSite.ID !== targetSiteId;
	};

	resetMigration = () => {
		const { targetSiteId, targetSiteSlug } = this.props;

		wpcom.resetMigration( targetSiteId ).then( () => {
			page( `/migrate/${ targetSiteSlug }` );
			this.updateFromAPI();
		} );
	};

	setSourceSiteId = sourceSiteId => {
		this.props.navigateToSelectedSourceSite( sourceSiteId );
	};

	startMigration = () => {
		const { sourceSiteId, targetSiteId } = this.props;

		if ( ! sourceSiteId || ! targetSiteId ) {
			return;
		}

		this.setState( { migrationStatus: 'backing-up', startTime: '' } );

		wpcom.startMigration( sourceSiteId, targetSiteId ).then( () => this.updateFromAPI() );
	};

	updateFromAPI = () => {
		const { targetSiteId } = this.props;
		wpcom
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
							this.setState( {
								migrationStatus,
								percent,
							} );
							return;
						}

						const localizedStartTime = startMoment
							.local()
							.locale( getLocaleSlug() )
							.format( 'lll' );

						this.setState( {
							migrationStatus,
							percent,
							startTime: localizedStartTime,
						} );
						return;
					}

					this.setState( {
						migrationStatus,
						percent,
					} );
				}
			} )
			.catch( () => {
				// @TODO: handle status error
			} );
	};

	isInProgress = () => {
		return includes( [ 'backing-up', 'restoring' ], this.state.migrationStatus );
	};

	isFinished = () => {
		return includes( [ 'done', 'error', 'unknown' ], this.state.migrationStatus );
	};

	renderCardBusinessFooter() {
		const { isTargetSiteAtomic } = this.props;

		// If the site is already Atomic, no upgrade footer is required
		if ( isTargetSiteAtomic ) {
			return null;
		}

		return (
			<CompactCard className="migrate__card-footer">
				A Business Plan is required to migrate your theme and plugins. Or you can{ ' ' }
				<a href={ this.getImportHref() }>import just your content</a> instead.
			</CompactCard>
		);
	}

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
					<div className="migrate__status">Your migration has completed successfully.</div>
					<Button primary href={ viewSiteURL }>
						View site
					</Button>
					<Button onClick={ this.resetMigration }>Start over</Button>
				</CompactCard>
			</>
		);
	}

	renderMigrationConfirmation() {
		const { sourceSite, targetSite, targetSiteSlug } = this.props;

		const sourceSiteDomain = get( sourceSite, 'domain' );
		const backHref = `/migrate/${ targetSiteSlug }`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Migrate { sourceSiteDomain }</HeaderCake>
				<CompactCard>
					<CardHeading>{ `Migrate everything from ${ sourceSiteDomain } to WordPress.com.` }</CardHeading>
					<div className="migrate__confirmation">
						We can move everything from your current site to this WordPress.com site. It will keep
						working as expected, but your WordPress.com dashboard will be locked during the
						migration.
					</div>
					<div className="migrate__sites">
						<Site site={ sourceSite } indicator={ false } />
						<Gridicon className="migrate__sites-arrow" icon="arrow-right" />
						<Site site={ targetSite } indicator={ false } />
					</div>
					<div className="migrate__confirmation">
						This will overwrite everything on your WordPress.com site.
						<ul className="migrate__list">
							<li>
								<Gridicon icon="checkmark" size="12" className="migrate__checkmark" />
								All posts, pages, comments, and media
							</li>
							<li>
								<Gridicon icon="checkmark" size="12" className="migrate__checkmark" />
								All users and roles
							</li>
							<li>
								<Gridicon icon="checkmark" size="12" className="migrate__checkmark" />
								Theme, plugins, and settings
							</li>
						</ul>
					</div>
					<Button primary onClick={ this.startMigration }>
						Migrate site
					</Button>
					<Button className="migrate__cancel" href={ backHref }>
						Cancel
					</Button>
				</CompactCard>
				{ this.renderCardBusinessFooter() }
			</>
		);
	}

	renderMigrationError() {
		return (
			<>
				<FormattedHeader
					className="migrate__section-header"
					headerText="Migrate"
					subHeaderText="Migrate your WordPress site to WordPress.com"
					align="left"
				/>
				<CompactCard>
					<div className="migrate__status">There was an error with your migration.</div>
					<Button primary onClick={ this.resetMigration }>
						Try again
					</Button>
				</CompactCard>
			</>
		);
	}

	renderMigrationProgress() {
		const { sourceSite, targetSite, translate } = this.props;
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );
		const subHeaderText = translate(
			`We're moving everything from {{span}}%(sourceSiteDomain)s{{/span}} ` +
				`to {{span}}%(targetSiteDomain)s{{/span}}.`,
			{
				args: { sourceSiteDomain: sourceSiteDomain, targetSiteDomain: targetSiteDomain },
				components: {
					span: <span className="migrate__domain" />,
				},
			}
		);

		return (
			<>
				<Card className="migrate__pane">
					<img
						className="migrate__illustration"
						src={ '/calypso/images/illustrations/waitTime-plain.svg' }
						alt=""
					/>
					<FormattedHeader
						className="migrate__section-header"
						headerText="Migration in progress"
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

		return <div className="migrate__start-time">Migration started { this.state.startTime }</div>;
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
				progressItemText = `Backed up from ${ sourceSiteDomain }`;
				if ( migrationStatus === 'backing-up' ) {
					progressItemText = `Backing up from ${ sourceSiteDomain }`;
				}
				break;
			case 'restoring':
				progressItemText = `Restoring to ${ targetSiteDomain }`;
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

	renderSourceSiteSelector() {
		return (
			<>
				<FormattedHeader
					className="migrate__section-header"
					headerText="Migrate your WordPress site to WordPress.com"
					align="left"
				/>
				<CompactCard className="migrate__card">
					<CardHeading>Select the Jetpack enabled site you want to migrate.</CardHeading>
					<div className="migrate__explain">
						If your site is connected to your WordPress.com account through Jetpack, we can migrate
						all your content, users, themes, plugins, and settings.
					</div>
					<SiteSelector
						className="migrate__source-site"
						onSiteSelect={ this.setSourceSiteId }
						filter={ this.jetpackSiteFilter }
					/>
					<div className="migrate__import-instead">
						Don't see it? You can still{ ' ' }
						<a href={ this.getImportHref() }>import just your content</a>.
					</div>
				</CompactCard>
				{ this.renderCardBusinessFooter() }
			</>
		);
	}

	render() {
		const { sourceSiteId } = this.props;

		let migrationElement;

		switch ( this.state.migrationStatus ) {
			case 'inactive':
				migrationElement = sourceSiteId
					? this.renderMigrationConfirmation()
					: this.renderSourceSiteSelector();
				break;

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
				<Interval onTick={ this.updateFromAPI } period={ EVERY_TEN_SECONDS } />
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
			targetSite: getSelectedSite( state ),
			targetSiteId,
			targetSiteImportAdminUrl: getSiteAdminUrl( state, targetSiteId, 'import.php' ),
			targetSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{ navigateToSelectedSourceSite }
)( localize( SectionMigrate ) );

import {
	planHasFeature,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	getPlan,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, CompactCard, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import HeaderCake from 'calypso/components/header-cake';
import SitesBlock from 'calypso/my-sites/migrate/components/sites-block';
import { isMigrationTrialSite } from 'calypso/sites-dashboard/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MigrateButton from './migrate-button.jsx';

import './section-migrate.scss';

class StepConfirmMigration extends Component {
	static propTypes = {
		sourceSite: PropTypes.object.isRequired,
		startMigration: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_site_migration_confirm_viewed', {} );
	}

	handleClick = () => {
		const { sourceSite, startMigration, targetSiteSlug, targetSite } = this.props;
		const sourceSiteId = get( sourceSite, 'ID' );
		const targetSiteId = get( targetSite, 'ID' );
		const sourceSiteSlug = get( sourceSite, 'slug', sourceSiteId );
		const sourceSiteUrl = get( sourceSite, 'URL', sourceSiteId );

		const hasCompatiblePlan = this.isTargetSitePlanCompatible();

		this.props.recordTracksEvent( 'calypso_site_migration_confirm_clicked', {
			plan_compatible: hasCompatiblePlan,
		} );

		if ( hasCompatiblePlan ) {
			const trackEventProps = {
				source_site_id: sourceSiteId,
				source_site_url: sourceSiteUrl,
				target_site_id: targetSiteId,
				target_site_slug: targetSiteSlug,
				is_migrate_from_wp: false,
				is_trial: isMigrationTrialSite( targetSite ),
				type: 'in-product',
			};
			return startMigration( trackEventProps );
		}

		page( `/migrate/upgrade/from/${ sourceSiteSlug }/to/${ targetSiteSlug }` );
	};

	isTargetSitePlanCompatible() {
		const { targetSite } = this.props;
		const planSlug = get( targetSite, 'plan.product_slug' );

		return planSlug && planHasFeature( planSlug, FEATURE_UPLOAD_THEMES_PLUGINS );
	}

	renderCardBusinessFooter() {
		const { translate } = this.props;

		// If the site is has an appropriate plan, no upgrade footer is required
		if ( this.isTargetSitePlanCompatible() ) {
			return null;
		}

		return (
			<CompactCard className="migrate__card-footer">
				<Gridicon className="migrate__card-footer-gridicon" icon="info-outline" size={ 12 } />
				<span className="migrate__card-footer-text">
					{ translate( 'A %(businessPlanName)s Plan is required to import everything.', {
						args: {
							businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle(),
						},
					} ) }
				</span>
			</CompactCard>
		);
	}

	renderMigrationButton() {
		const { targetSite, translate } = this.props;
		const targetSiteDomain = get( targetSite, 'domain' );

		if ( this.isTargetSitePlanCompatible() ) {
			return (
				<MigrateButton onClick={ this.handleClick } targetSiteDomain={ targetSiteDomain }>
					{ translate( 'Import Everything' ) }
				</MigrateButton>
			);
		}

		return (
			<Button primary onClick={ this.handleClick }>
				{ translate( 'Import Everything' ) }
			</Button>
		);
	}

	render() {
		const { sourceSite, targetSite, targetSiteSlug, translate } = this.props;

		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );
		const backHref = `/migrate/${ targetSiteSlug }`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Import { sourceSiteDomain }</HeaderCake>
				<SitesBlock
					sourceSite={ sourceSite }
					loadingSourceSite={ false }
					targetSite={ targetSite }
				/>
				<CompactCard>
					<CardHeading>
						{ translate(
							'Import everything from %(sourceSiteDomain)s and overwrite everything on %(targetSiteDomain)s?',
							{
								args: {
									sourceSiteDomain,
									targetSiteDomain,
								},
							}
						) }
					</CardHeading>
					<div className="migrate__confirmation">
						<ul className="migrate__list">
							<li>
								<Gridicon icon="checkmark" size="12" className="migrate__checkmark" />
								{ translate( 'All posts, pages, comments, and media' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size="12" className="migrate__checkmark" />
								{ translate( 'All users and roles' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size="12" className="migrate__checkmark" />
								{ translate( 'Theme, plugins, and settings' ) }
							</li>
						</ul>
						<div>
							{ translate(
								'Your site will keep working, but your WordPress.com dashboard will be locked during importing.'
							) }
						</div>
					</div>
					{ this.renderMigrationButton() }
				</CompactCard>
				{ this.renderCardBusinessFooter() }
			</>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( StepConfirmMigration ) );

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { Button, CompactCard } from '@automattic/components';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import Gridicon from 'calypso/components/gridicon';
import HeaderCake from 'calypso/components/header-cake';
import MigrateButton from './migrate-button.jsx';
import SitesBlock from 'calypso/my-sites/migrate/components/sites-block';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from 'calypso/lib/plans/constants';
import { planHasFeature } from 'calypso/lib/plans';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
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
		const { sourceSite, startMigration, targetSiteSlug } = this.props;
		const sourceSiteId = get( sourceSite, 'ID' );
		const sourceSiteSlug = get( sourceSite, 'slug', sourceSiteId );

		const hasCompatiblePlan = this.isTargetSitePlanCompatible();

		this.props.recordTracksEvent( 'calypso_site_migration_confirm_clicked', {
			plan_compatible: hasCompatiblePlan,
		} );

		if ( hasCompatiblePlan ) {
			return startMigration();
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
					{ translate( 'A Business Plan is required to import everything.' ) }
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

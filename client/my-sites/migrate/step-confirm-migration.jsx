/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { Button, CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Site from 'blocks/site';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from 'lib/plans/constants';
import { planHasFeature } from 'lib/plans';

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

	handleClick = () => {
		const { sourceSite, targetSite, targetSiteSlug } = this.props;
		const sourceSiteId = get( sourceSite, 'ID' );
		const sourceSiteSlug = get( sourceSite, 'slug', sourceSiteId );
		const planSlug = get( targetSite, 'plan.product_slug' );
		if ( planSlug && planHasFeature( planSlug, FEATURE_UPLOAD_THEMES_PLUGINS ) ) {
			return this.startMigration();
		}

		page( `/migrate/upgrade/from/${ sourceSiteSlug }/to/${ targetSiteSlug }` );
	};

	render() {
		const { sourceSite, targetSite, targetSiteSlug } = this.props;

		const sourceSiteDomain = get( sourceSite, 'domain' );
		const backHref = `/migrate/${ targetSiteSlug }`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Import { sourceSiteDomain }</HeaderCake>
				<div className="migrate__sites">
					<div className="migrate__sites-item">
						<Site site={ sourceSite } indicator={ false } />
					</div>
					<div className="migrate__sites-arrow-wrapper">
						<Gridicon className="migrate__sites-arrow" icon="arrow-right" />
					</div>
					<div className="migrate__sites-item">
						<Site site={ targetSite } indicator={ false } />
						<div className="migrate__sites-labels-container">
							<span className="migrate__token-label">This site</span>
						</div>
					</div>
				</div>
				<CompactCard>
					<Button primary onClick={ this.handleClick }>
						Import everything
					</Button>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepConfirmMigration );

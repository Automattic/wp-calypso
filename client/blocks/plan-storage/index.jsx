/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { planHasFeature } from 'lib/plans';
import { FEATURE_UNLIMITED_STORAGE } from 'lib/plans/constants';
import PlanStorageBar from './bar';

/**
 * Style dependencies
 */
import './style.scss';

export class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		siteId: PropTypes.number,
		sitePlanSlug: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			canUserUpgrade,
			canViewBar,
			className,
			jetpackSite,
			siteId,
			sitePlanSlug,
			siteSlug,
		} = this.props;

		if ( jetpackSite || ! canViewBar || ! sitePlanSlug ) {
			return null;
		}

		if ( planHasFeature( sitePlanSlug, FEATURE_UNLIMITED_STORAGE ) ) {
			return null;
		}

		return (
			<div className={ classNames( className, 'plan-storage' ) }>
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ sitePlanSlug }
					mediaStorage={ this.props.mediaStorage }
					displayUpgradeLink={ canUserUpgrade }
				>
					{ this.props.children }
				</PlanStorageBar>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { siteId } = ownProps;
	return {
		mediaStorage: getMediaStorage( state, siteId ),
		jetpackSite: isJetpackSite( state, siteId ),
		sitePlanSlug: getSitePlanSlug( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		canUserUpgrade: canCurrentUser( state, siteId, 'manage_options' ),
		canViewBar: canCurrentUser( state, siteId, 'publish_posts' ),
	};
} )( PlanStorage );

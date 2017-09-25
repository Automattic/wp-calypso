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
import PlanStorageBar from './bar';
import QueryMediaStorage from 'components/data/query-media-storage';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'state/sites/selectors';

class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		siteId: PropTypes.number,
		sitePlanSlug: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	render() {
		const {
			className,
			jetpackSite,
			siteId,
			sitePlanSlug,
			siteSlug,
		} = this.props;

		if ( jetpackSite || ! sitePlanSlug ) {
			return null;
		}

		if ( sitePlanSlug === PLAN_BUSINESS ) {
			return null;
		}

		return (
			<div className={ classNames( className, 'plan-storage' ) } >
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ sitePlanSlug }
					mediaStorage={ this.props.mediaStorage }
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
	};
} )( PlanStorage );

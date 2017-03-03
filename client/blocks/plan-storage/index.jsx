/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isJetpackSite
} from 'state/sites/selectors';

import PlanStorageBar from './bar';

class PlanStorage extends Component {
	static propTypes = {
		className: PropTypes.string,
		mediaStorage: PropTypes.object,
		siteId: PropTypes.number,
	};

	render() {
		const {
			className,
			jetpackSite,
			siteId,
			sitePlan,
			siteSlug,
		} = this.props;

		if ( jetpackSite || ! sitePlan ) {
			return null;
		}

		return (
			<div className={ classNames( className, 'plan-storage' ) } >
				<QueryMediaStorage siteId={ siteId } />
				<PlanStorageBar
					siteSlug={ siteSlug }
					sitePlanSlug={ sitePlan.product_slug }
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
		sitePlan: getSitePlan( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( PlanStorage );

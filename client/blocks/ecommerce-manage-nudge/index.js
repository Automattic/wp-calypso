/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import isECommerceManageNudgeDismissed from './selectors';
import QueryPreferences from 'components/data/query-preferences';
import { dismissNudge } from './actions';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';

/**
 * Style dependencies
 */
import './style.scss';

class ECommerceManageNudge extends Component {
	static propTypes = {
		isDismissed: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.recordView();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId && this.props.siteId && this.props.siteId !== prevProps.siteId ) {
			this.recordView();
		}
	}

	recordView() {
		if ( this.isVisible() ) {
			this.props.recordTracksEvent( 'calypso_ecommerce_manage_stats_nudge_view' );
		}
	}

	onDismissClick = () => {
		this.props.recordTracksEvent( 'calypso_ecommerce_manage_stats_nudge_dismiss_icon_click' );
		this.props.dismissNudge();
	};

	isVisible() {
		return ! this.props.isDismissed;
	}

	render() {
		const { translate } = this.props;

		if ( ! this.isVisible() ) {
			return null;
		}

		return (
			<Card className="ecommerce-manage-nudge">
				<QueryPreferences />
				<Gridicon
					icon="cross"
					className="ecommerce-manage-nudge__close-icon"
					onClick={ this.onDismissClick }
				/>
				<div className="ecommerce-manage-nudge__body">
					<p>
						{ translate(
							'To manage your WordPress.com Store powered by WooCommerce, click on Store in the sidebar.'
						) }
					</p>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isDismissed: isECommerceManageNudgeDismissed( state, ownProps.siteId ),
	} ),
	{
		dismissNudge,
		recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
	}
)( localize( ECommerceManageNudge ) );

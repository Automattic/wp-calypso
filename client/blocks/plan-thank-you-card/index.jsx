/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import Gridicon from 'components/gridicon';

class PlanThankYouCard extends Component {
	static propTypes = {
		selectedSite: PropTypes.object
	};

	render() {
		// Non standard gridicon sizes are used here because we use them as background pattern with various sizes and rotation
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="plan-thank-you-card">
				<div className="plan-thank-you-card__header">
					<Gridicon className="plan-thank-you-card__main-icon" icon="checkmark-circle" size={ 140 } />
					<div className="plan-thank-you-card__plan-name">{ this.props.selectedSite.plan.product_name_short }</div>
					<div className="plan-thank-you-card__background-icons">
						<Gridicon icon="heart" size={ 52 } />
						<Gridicon icon="heart" size={ 20 } />
						<Gridicon icon="heart" size={ 52 } />
						<Gridicon icon="heart" size={ 41 } />
						<Gridicon icon="heart" size={ 26 } />
						<Gridicon icon="status" size={ 52 } />
						<Gridicon icon="status" size={ 38 } />
						<Gridicon icon="status" size={ 28 } />
						<Gridicon icon="status" size={ 65 } />
						<Gridicon icon="star" size={ 57 } />
						<Gridicon icon="star" size={ 33 } />
						<Gridicon icon="star" size={ 45 } />
					</div>
				</div>
				<div className="plan-thank-you-card__body">
					<div className="plan-thank-you-card__heading">
						{ this.props.translate( 'Thank you for your purchase!' ) }
					</div>
					<div className="plan-thank-you-card__description">
						{ this.props.translate( 'Now that we’ve taken care of the plan, its time to see your new site.' ) }
					</div>
					<a
						className="plan-thank-you-card__button"
						href={ this.props.selectedSite.URL }>
						{ this.props.translate( 'Visit your site' ) }
					</a>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default connect( ( state, ownProps ) => {
	let selectedSite = getSelectedSite( state );

	if ( ownProps.selectedSite && ! selectedSite ) {
		selectedSite = ownProps.selectedSite;
	}

	return {
		selectedSite
	};
} )( localize( PlanThankYouCard ) );

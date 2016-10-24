/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import Gridicon from 'components/gridicon';
import PlanPrice from 'components/plans/plan-price';
import { getSitePlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanBySlug } from 'state/plans/selectors';
import { PLAN_PREMIUM } from 'lib/plans/constants';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryPlans from 'components/data/query-plans';

let exclusiveViewLock = null;

const PremiumPopover = React.createClass( {
	propTypes: {
		className: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.object, React.PropTypes.array ] ),
		onClose: React.PropTypes.func,
		isVisible: React.PropTypes.bool,
		position: React.PropTypes.string.isRequired,
		textLabel: React.PropTypes.string
	},
	getInitialState() {
		return {
			visibleByClick: false,
			visibleByHover: false
		};
	},
	isVisible() {
		return (
			this.props.isVisible ||
			this.state.visibleByClick ||
			this.state.visibleByHover
		) &&
			( ! exclusiveViewLock || exclusiveViewLock === this );
	},
	priceMessage( price ) {
		return this.translate( '%(cost)s {{small}}/year{{/small}}', {
			args: { cost: price },
			components: { small: <small /> }
		} );
	},
	componentWillUnmount() {
		if ( exclusiveViewLock === this ) {
			exclusiveViewLock = null;
		}
	},
	handleClick() {
		exclusiveViewLock = this;
		this.setState( { visibleByClick: true } );
	},
	handleMouseEnter() {
		this.setState( { visibleByHover: true } );
	},
	handleMouseLeave() {
		this.setState( { visibleByHover: false } );
	},
	onClose( event ) {
		if ( exclusiveViewLock === this ) {
			exclusiveViewLock = null;
		}

		this.setState( {
			visibleByClick: false,
			visibleByHover: false
		} );

		if ( this.props.onClose ) {
			return this.props.onClose( event );
		}
	},
	render() {
		const { selectedSiteId, premiumPlan, premiumSitePlan } = this.props;
		const popoverClasses = classNames( this.props.className, 'premium-popover popover' );
		const context = this.refs && this.refs[ 'popover-premium-reference' ];

		return (
			<div>
				<QueryPlans />
				<QuerySitePlans siteId={ selectedSiteId } />
				<span
					onClick={ this.handleClick }
					onMouseEnter={ this.handleMouseEnter }
					ref="popover-premium-reference"
					onMouseLeave={ this.handleMouseLeave }>
					{ this.props.textLabel }
				</span>

				<Popover
					id="popover__premium"
					{ ...omit( this.props, [ 'children', 'className', 'textLabel' ] ) }
					onClose={ this.onClose }
					context={ context }
					isVisible={ this.isVisible() }
					className={ popoverClasses }
				>
					<div className="premium-popover__content">
						<div className="premium-popover__header">
							<h3>{ this.translate( 'Premium', { context: 'Premium Plan' } ) }</h3>
							{ premiumPlan
								? <PlanPrice plan={ premiumPlan } sitePlan={ premiumSitePlan } />
								: <h5>Loading</h5> }
						</div>
						<ul className="premium-popover__items">
							{ [
								this.translate( 'A custom domain' ),
								this.translate( 'Advanced design customization' ),
								this.translate( '13GB of space for file and media' ),
								this.translate( 'Video Uploads' ),
								this.translate( 'No Ads' ),
								this.translate( 'Email and live chat support' )
							].map( ( message, i ) => <li key={ i }><Gridicon icon="checkmark" size={ 18 } /> { message }
							</li> ) }
						</ul>
					</div>

				</Popover>
			</div>
		);
	}
} );

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		selectedSiteId,
		premiumPlan: getPlanBySlug( state, PLAN_PREMIUM ),
		premiumSitePlan: getSitePlan( state, selectedSiteId, PLAN_PREMIUM )
	};
} )( PremiumPopover );

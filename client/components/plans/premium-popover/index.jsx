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
import { fetchSitePlans } from 'state/sites/plans/actions';
import { shouldFetchSitePlans } from 'lib/plans';
import { getPlansBySite } from 'state/sites/plans/selectors';
import SitesList from 'lib/sites-list';
import PlansList from 'lib/plans-list';
const plansList = PlansList();
const sitesList = SitesList();

const PremiumPopover = React.createClass( {
	propTypes: {
		context: React.PropTypes.object,
		className: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.object, React.PropTypes.array ] ),
		onClose: React.PropTypes.func,
		isVisible: React.PropTypes.bool,
		position: React.PropTypes.string.isRequired,
		bindContextEvents: React.PropTypes.bool
	},
	getInitialState() {
		return {
			shouldBindEvents: !! this.props.bindContextEvents,
			visibleByClick: false,
			visibleByHover: false
		};
	},
	componentDidMount() {
		this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
		this.props.fetchPlans();
	},
	componentWillReceiveProps( nextProps ) {
		this.props.fetchSitePlans( nextProps.sitePlans, nextProps.selectedSite );
	},
	isVisible() {
		return this.props.isVisible || this.state.visibleByClick || this.state.visibleByHover;
	},
	priceMessage( price ) {
		return this.translate( '%(cost)s {{small}}/year{{/small}}', {
			args: { cost: price },
			components: { small: <small /> }
		} );
	},
	getSitePlan() {
		return ( this.props.sitePlans.data || [] ).find( plan => plan.product_slug === 'value_bundle' );
	},
	componentDidUpdate() {
		if ( this.state.shouldBindEvents && this.props.context ) {
			this.bindContextEvents();
			this.setState( { shouldBindEvents: false } );
		}
	},
	bindContextEvents() {
		const elm = this.props.context;
		elm.addEventListener( 'click', () => {
			this.setState( { visibleByClick: true } );
		} );
		elm.addEventListener( 'mouseenter', () => {
			this.setState( { visibleByHover: true } );
		} );
		elm.addEventListener( 'mouseleave', () => {
			this.setState( { visibleByHover: false } );
		} );
	},
	onClose( event ) {
		this.setState( {
			visibleByClick: false,
			visibleByHover: false
		} );
		if ( this.props.onClose ) {
			return this.props.onClose( event );
		}
	},
	render() {
		const premiumPlan = this.props.plans.find( plan => plan.product_slug === 'value_bundle' );
		return (
			<Popover
				{ ...omit( this.props, [ 'children', 'className', 'bindContextEvents' ] ) }
				onClose={ this.onClose }
				isVisible={ this.isVisible() }
				className={ classNames( this.props.className, 'premium-popover popover' ) }>
				<div className="premium-popover__content">
					<div className="premium-popover__header">
						<h3>{ this.translate( 'Premium', { context: 'Premium Plan' } ) }</h3>
						{ premiumPlan ? <PlanPrice plan={ premiumPlan } sitePlan={ this.getSitePlan() }/> : <h5>Loading</h5> }
					</div>
					<ul className="premium-popover__items">
						{ [
							this.translate( 'A custom domain' ),
							this.translate( 'Advanced design customization' ),
							this.translate( '13GB of space for file and media' ),
							this.translate( 'Video Uploads' ),
							this.translate( 'No Ads' ),
							this.translate( 'Email and live chat support' )
						].map( ( message, i ) => <li key={ i }><Gridicon icon="checkmark" size={ 18 }/> { message }</li> ) }
					</ul>
				</div>
			</Popover>
		);
	}
} );

export default connect( ( state ) => {
	return {
		sitePlans: getPlansBySite( state, sitesList.getSelectedSite() ),
		plans: plansList.get()
	};
}, ( dispatch ) => {
	return {
		fetchSitePlans( sitePlans, site ) {
			if ( shouldFetchSitePlans( sitePlans, site ) ) {
				dispatch( fetchSitePlans( site.ID ) );
			}
		},
		fetchPlans() {
			plansList.fetch();
		}
	};
} )( PremiumPopover );

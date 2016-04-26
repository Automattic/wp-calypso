/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'PremiumPopover',
	propTypes: {
		context: React.PropTypes.object,
		className: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.object, React.PropTypes.array ] ),
		onClose: React.PropTypes.func,
		isVisible: React.PropTypes.bool,
		products: React.PropTypes.object.isRequired,
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
	isVisible() {
		return this.props.isVisible || this.state.visibleByClick || this.state.visibleByHover;
	},
	priceMessage( price ) {
		return this.translate( '%(cost)s {{small}}/year{{/small}}', {
			args: { cost: price },
			components: { small: <small /> }
		} );
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
		return (
			<Popover
				{ ...omit( this.props, [ 'children', 'className', 'bindContextEvents' ] ) }
				onClose={ this.onClose }
				isVisible={ this.isVisible() }
				className={ classNames( this.props.className, 'premium-popover popover' ) }>
				<div className="premium-popover__content">
					<div className="premium-popover__header">
						<h3>{ this.translate( 'Premium', { context: 'Premium Plan' } ) }</h3>
						<h5>{ this.props.products ? this.priceMessage( this.props.products.value_bundle.cost_display ) : this.translate( 'Loading' ) }</h5>
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

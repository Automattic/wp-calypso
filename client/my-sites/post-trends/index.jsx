/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' ),
	throttle = require( 'lodash/function/throttle' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	i18n = require( 'lib/mixins/i18n' ),
	Month = require( './month.jsx' );

module.exports = React.createClass( {

	displayName: 'PostTrends',

	mixins: [ observe( 'streakList' ) ],

	propTypes: {
		streakList: React.PropTypes.object.isRequired
	},

	getInitialState: function() {
		return {
			canScrollLeft: false,
			canScrollRight: false
		};
	},

	componentDidMount: function() {
		var node = this.refs.wrapper,
			yearNode = this.refs.year,
			computedStyle = window.getComputedStyle( yearNode ),
			margin = parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) + parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 );

		// Initially scroll all the way to the left
		yearNode.style.left = ( 0 - yearNode.scrollWidth + node.clientWidth - margin ) + 'px';

		// Add resize listener
		this.resize = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resize );
		this.resize();
	},

	// Remove listener
	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.resize );
	},

	resize: function() {
		var scrollProps = {},
			node = this.refs.wrapper,
			yearNode = this.refs.year,
			computedStyle = window.getComputedStyle( yearNode ),
			margin = parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) + parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 ),
			left = parseInt( yearNode.style.left, 10 );

		scrollProps.canScrollLeft = left < 0;
		scrollProps.canScrollRight = ( left > ( 0 - yearNode.scrollWidth + node.clientWidth - margin ) );

		if ( this.state.canScrollLeft && node.clientWidth > ( yearNode.scrollWidth - margin ) ) {
			yearNode.style.left = '0px';
		}

		this.setState( scrollProps );
	},

	scroll: function( direction ) {
		var node = this.refs.wrapper,
			yearNode = this.refs.year,
			computedStyle = window.getComputedStyle( yearNode ),
			margin = parseInt( computedStyle.getPropertyValue( 'margin-left' ), 10 ) + parseInt( computedStyle.getPropertyValue( 'margin-right' ), 10 ),
			left = parseInt( computedStyle.getPropertyValue( 'left' ), 10 );

		if ( 1 !== direction ) {
			direction = -1;
		}

		// scroll left 80% of the clientWidth
		left -= Math.ceil( direction * node.clientWidth * 0.8 );

		// enforce bounds
		if ( left > 0 ) {
			left = 0;
		} else if ( left < ( 0 - yearNode.scrollWidth + node.clientWidth - margin ) ) {
			left = ( 0 - yearNode.scrollWidth + node.clientWidth - margin );
		}

		yearNode.style.left = left + 'px';

		this.resize();
	},

	scrollLeft: function() {
		this.scroll( -1 );
	},

	scrollRight: function() {
		this.scroll( 1 );
	},

	getMonthComponents: function() {
		var i,
			months = [],
			startDate;

		for ( i = 11; i >= 0; i-- ) {
			startDate = i18n.moment().subtract( i, 'months' ).startOf( 'month' );
			months.push( <Month key={ startDate.format( 'YYYYMM' ) } startDate={ startDate } data={ this.props.streakList } /> );
		}

		return months;
	},

	render: function() {
		var leftClass,
			rightClass,
			containerClass;

		leftClass = classNames( 'post-trends__scroll-left', {
			'is-active': this.state.canScrollLeft
		} );

		rightClass = classNames( 'post-trends__scroll-right', {
			'is-active': this.state.canScrollRight
		} );

		containerClass = classNames( 'post-trends', {
			'is-loading': this.props.streakList.isLoading()
		} );

		return (
			<div className={ containerClass }>
				<h1 className="post-trends__title">{ this.translate( 'Posting activity' ) }</h1>
				<div ref="wrapper" className="post-trends__wrapper">
					<div ref="year" className="post-trends__year">
						{ this.getMonthComponents() }
					</div>
				</div>
				<div className={ leftClass } onClick={ this.scrollLeft }><span className='left-arrow'></span></div>
				<div className={ rightClass } onClick={ this.scrollRight }><span className='right-arrow'></span></div>
				<div className="post-trends__key-container">
					<span className="post-trends__key-label">{ this.translate( 'Fewer Posts', { context: 'Legend label in stats post trends visualization' } ) }</span>
					<ul className="post-trends__key">
						<li className="post-trends__key-day is-today"></li>
						<li className="post-trends__key-day is-level-1"></li>
						<li className="post-trends__key-day is-level-2"></li>
						<li className="post-trends__key-day is-level-3"></li>
						<li className="post-trends__key-day is-level-4"></li>
					</ul>
					<span className="post-trends__key-label">{ this.translate( 'More Posts', { context: 'Legend label in stats post trends visualization' } ) }</span>
				</div>
			</div>
		);
	}

} );

/**
 * External Dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */
import Count from 'components/count';
import { preload } from 'sections-preload';

/**
 * Main
 */
var NavItem = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		itemType: React.PropTypes.string,
		path: React.PropTypes.string,
		selected: React.PropTypes.bool,
		tabIndex: React.PropTypes.number,
		onClick: React.PropTypes.func,
		isExternalLink: React.PropTypes.bool,
		disabled: React.PropTypes.bool,
		count: React.PropTypes.number,
		className: React.PropTypes.string,
		preloadSectionName: React.PropTypes.string
	},

	_preloaded: false,

	preload() {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	},

	render: function() {
		var itemClassPrefix = this.props.itemType
			? this.props.itemType
			: 'tab',

			itemClassName, target, onClick,

			itemClasses = {
				'is-selected': this.props.selected,
				'is-external': this.props.isExternalLink
			};

		itemClasses[ 'section-nav-' + itemClassPrefix ] = true;
		itemClassName = classNames( this.props.className, itemClasses );

		if ( this.props.isExternalLink ) {
			target = '_blank';
		}

		if ( ! this.props.disabled ) {
			onClick = this.props.onClick;
		}

		return (
			<li className={ itemClassName }>
				<a
					href={ this.props.path }
					target={ target }
					className={ 'section-nav-' + itemClassPrefix + '__link' }
					onClick={ onClick }
					onMouseEnter={ this.preload }
					tabIndex={ this.props.tabIndex || 0 }
					aria-selected={ this.props.selected }
					disabled={ this.props.disabled }
					role="menuitem"
					rel={ this.props.isExternalLink ? 'external' : null }>
					<span className={ 'section-nav-' + itemClassPrefix + '__text' }>
						{ this.props.children }
						{
							'number' === typeof this.props.count &&
							<Count count={ this.props.count } />
						}
					</span>
				</a>
			</li>
		);
	}
} );

module.exports = NavItem;

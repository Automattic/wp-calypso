/**
 * External Dependencies
 */
const React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */
const Gridicon = require( 'components/gridicon' ),
	Count = require( 'components/count' );

const SidebarMenu = React.createClass( {

	propTypes: {
		title: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ).isRequired,
		count: React.PropTypes.integer
	},

	getInitialState: function() {
		return {
			expanded: this.props.expanded
		};
	},

	getDefaultProps: function() {
		return {
			expanded: false
		};
	},

	onClick: function() {
		if ( this.props.children ) {
			this.setState( { expanded: ! this.state.expanded } );
		}
	},

	getClickAction: function() {
		if ( this.props.disabled ) {
			return;
		}
		return this.onClick;
	},

	renderContent: function() {
		return (
			<div className="sidebar-menu__list">
				{ this.props.children }
			</div>
		);
	},

	renderHeader: function() {
		const headerClasses = classNames( 'sidebar-menu__header' );
		return (
			<div className={ headerClasses } onClick={ this.onClick }>
				<h2 className="sidebar-heading">
						<Gridicon icon="chevron-down" />
						<span>{ this.props.title }</span>
						{ this.props.count
							? <Count count={ this.props.count } />
							: null
						}
				</h2>
			</div>
		);
	},

	render: function() {
		const classes = classNames(
			'sidebar-menu',
			this.props.className,
			{
				'is-toggle-open': !! this.state.expanded,
				'is-togglable': true,
				'is-dynamic': true
			}
		);

		return (
			<li className={ classes }>
				{ this.renderHeader() }
				{ this.renderContent() }
			</li>
		);
	}
} );

module.exports = SidebarMenu;

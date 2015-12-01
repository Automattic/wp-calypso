/**
 * External Dependencies
 */
const React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */
const Gridicon = require( 'components/gridicon' ),
	Button = require( 'components/button' ),
	Count = require( 'components/count' );

const SidebarMenu = React.createClass( {

	propTypes: {
		title: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ).isRequired,
		count: React.PropTypes.number,
		addPlaceholder: React.PropTypes.string,
		onAddSubmit: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			expanded: this.props.expanded,
			isAdding: false
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
			<ul className="sidebar-menu__list">
				{ this.props.children }
			</ul>
		);
	},

	renderHeader: function() {
		const headerClasses = classNames( 'sidebar-menu__header' );
		return (
			<div className={ headerClasses } onClick={ this.onClick }>
				<h2 className="sidebar-heading">
					<Gridicon icon="chevron-down" />
					<span>{ this.props.title }</span>
					<Count count={ this.props.count } />
				</h2>

				<div></div>
			</div>
		);
	},

	toggleAdd: function() {
		this.setState( { isAdding: ! this.state.isAdding } );
	},

	handleAddKeyDown: function() {
		var inputValue = React.findDOMNode( this.refs.menuAddInput ).value;
		if ( event.keyCode === 13 ) {
			event.preventDefault();
			this.props.onAddSubmit( inputValue );
		}
	},

	renderAdd: function() {
		return(
			<div className="sidebar-menu__add-item">
				<Button compact className="sidebar-menu__add-button" onClick={ this.toggleAdd }>Add</Button>

				<div className="sidebar-menu__add">
					<input
						className="sidebar-menu__add-input"
						type="text"
						placeholder={ this.props.addPlaceholder }
						ref="menuAddInput"
						onKeyDown={ this.handleAddKeyDown }
					/>
					<Gridicon icon="cross-small" onClick={ this.toggleAdd } />
				</div>
			</div>
		);
	},

	render: function() {
		const classes = classNames(
			'sidebar-menu',
			this.props.className,
			{
				'is-add-open': this.state.isAdding,
				'is-toggle-open': !! this.state.expanded,
				'is-togglable': true,
				'is-dynamic': true
			}
		);

		return (
			<li className={ classes }>
				{ this.renderHeader() }
				{ this.renderAdd() }
				{ this.renderContent() }
			</li>
		);
	}
} );

module.exports = SidebarMenu;

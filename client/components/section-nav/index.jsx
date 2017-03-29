/**
 * External Dependencies
 */
var React = require( 'react' ),
	isEqual = require( 'lodash/isEqual' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */
var NavTabs = require( './tabs' ),
	NavItem = require( './item' ),
	Search = require( 'components/search' );

/**
 * Main
 */
var SectionNav = React.createClass( {

	propTypes: {
		children: React.PropTypes.node,
		selectedText: React.PropTypes.node,
		selectedCount: React.PropTypes.number,
		hasPinnedItems: React.PropTypes.bool,
		onMobileNavPanelOpen: React.PropTypes.func,
		className: React.PropTypes.string,
	},

	getInitialState: function() {
		return {
			mobileOpen: false
		};
	},

	getDefaultProps: function() {
		return {
			onMobileNavPanelOpen: () => {}
		};
	},

	componentWillMount: function() {
		this.checkForSiblingControls( this.props.children );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( isEqual( this.props, nextProps ) ) {
			return;
		}

		this.checkForSiblingControls( nextProps.children );

		if ( ! this.hasSiblingControls ) {
			this.closeMobilePanel();
		}
	},

	render: function() {
		var children = this.getChildren(),
			className;

		if ( ! children ) {
			className = classNames( {
				'section-nav': true,
				'is-empty': true
			}, this.props.className );

			return (
				<div className={ className }>
					<div className="section-nav__panel">
						<NavItem></NavItem>
					</div>
				</div>
			);
		}

		className = classNames( {
			'section-nav': true,
			'is-open': this.state.mobileOpen,
			'has-pinned-items': this.hasPinnedSearch || this.props.hasPinnedItems
		}, this.props.className );

		return (
			<div className={ className }>
				<div
					className="section-nav__mobile-header"
					onClick={ this.toggleMobileOpenState }
				>
					<span className="section-nav__mobile-header-text">
						{ this.props.selectedText }
					</span>
				</div>

				<div className="section-nav__panel">
					{ children }
				</div>
			</div>
		);
	},

	getChildren: function() {
		return React.Children.map( this.props.children, function( child ) {
			var extraProps = {
				hasSiblingControls: this.hasSiblingControls,
				closeSectionNavMobilePanel: this.closeMobilePanel
			};

			if ( ! child ) {
				return null;
			}

			// Propagate 'selectedText' to NavItem component
			if (
				child.type === NavTabs &&
				! child.props.selectedText &&
				typeof this.props.selectedText === 'string'
			) {
				extraProps.selectedText = this.props.selectedText;
			}

			// Propagate 'selectedCount' to NavItem component
			if ( child.type === NavTabs && this.props.selectedCount ) {
				extraProps.selectedCount = this.props.selectedCount;
			}

			if ( child.type === Search ) {
				if ( child.props.pinned ) {
					this.hasPinnedSearch = true;
				}

				extraProps.onSearch = this.generateOnSearch( child.props.onSearch );
			}

			return React.cloneElement( child, extraProps );
		}.bind( this ) );
	},

	closeMobilePanel: function() {
		if ( window.innerWidth < 480 && this.state.mobileOpen ) {
			this.setState( {
				mobileOpen: false
			} );
		}
	},

	toggleMobileOpenState: function() {
		var mobileOpen = ! this.state.mobileOpen;

		this.setState( {
			mobileOpen: mobileOpen
		} );

		if ( mobileOpen ) {
			this.props.onMobileNavPanelOpen();
		}
	},

	generateOnSearch: function( existingOnSearch ) {
		return function() {
			existingOnSearch.apply( this, arguments );
			this.closeMobilePanel();
		}.bind( this );
	},

	checkForSiblingControls: function( children ) {
		this.hasSiblingControls = false;

		React.Children.forEach( children, function( child, index ) {
			// Checking for at least 2 controls groups that are not search or null
			if ( index && child && child.type !== Search ) {
				this.hasSiblingControls = true;
			}
		}.bind( this ) );
	}
} );

module.exports = SectionNav;

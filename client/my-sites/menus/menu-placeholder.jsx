/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Component
 */
var MenuPlaceholder = React.createClass( {
	render: function() {
		return (
			<div>
				<div className="menus__menu-header">
					<h2 className="menus__menu-name">
						<span className="placeholder-text" disabled={ true }>
							Loading active menu...
						</span>
					</h2>
				</div>

				<ul className="menus__items">
					<div>
						<a className="menus__menu-item depth-1">
							<label className={ 'menu-item-name noticon noticon-standard noticon-placeholder' }>
								<span className="placeholder-text">Loading menu items...</span>
							</label>
						</a>
					</div>
				</ul>
			</div>
		);
	},
} );

export default MenuPlaceholder;
	

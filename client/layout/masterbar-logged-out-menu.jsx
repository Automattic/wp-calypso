/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	handleClickTitle( event ) {
		event.preventDefault();

		// redirect using window directly to prevent the user from hitting the dead-end path handler
		window.location = '/';
	},

	render() {
		return (
			<nav className="wpcom-sections">
				<ul className="sections-menu">
					<li className="wpcom-title">
						<a href="/" onClick={ this.handleClickTitle }>
							<span className="noticon noticon-wordpress"></span>
							<span className="section-label">WordPress<span className="tld">.com</span></span>
						</a>
					</li>
				</ul>
			</nav>
		);
	}

} );

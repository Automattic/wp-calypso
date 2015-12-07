/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	handleClickTitle( event ) {
		event.preventDefault();

		// redirect using window directly to prevent the user from hitting the dead-end path handler
		window.location = '/';
	},

	render() {
		return (
			<nav className="masterbar__sections">
				<ul className="masterbar__sections-menu">
					<li className="masterbar__item wpcom-title">
						<a href="/" onClick={ this.handleClickTitle }>
							<Gridicon icon="my-sites" size={ 24 } />
							<span className="masterbar__label">WordPress<span className="tld">.com</span></span>
						</a>
					</li>
				</ul>
			</nav>
		);
	}

} );

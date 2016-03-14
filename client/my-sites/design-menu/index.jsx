/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import layoutFocus from 'lib/layout-focus';

const DesignMenu = React.createClass( {

	onBack() {
		layoutFocus.set( 'sidebar' );
	},

	render() {
		return (
			<div className="design-menu">
				<span className="current-site__switch-sites">
					<Button compact borderless onClick={ this.onBack }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ this.translate( 'Back' ) }
					</Button>
				</span>
				<Card>
					Design Tools!
				</Card>
			</div>
		);
	}
} );

export default DesignMenu;

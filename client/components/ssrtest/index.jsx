/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import Button from 'components/button';

export default React.createClass( {

	getInitialState() {
		return { clicks: 0 };
	},

	click() {
		this.setState( { clicks: this.state.clicks + 1 } );
	},

	render() {
		return(
			<Main>
				<Card id="Themes" >
					<span>Clicks: { this.state.clicks }</span>
				</Card>
				<Button onClick={ this.click }>Click</Button>
			</Main>
		)
	},
} );


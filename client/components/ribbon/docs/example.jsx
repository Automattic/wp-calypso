/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Ribbon from '../index';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'Ribbon',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/ribbon">Ribbon</a>
				</h2>
				<Card>
					<Ribbon>WordPress</Ribbon>
					<p> 
						Everything is WordPress and WordPress is WordPress because WordPress will WordPress
						all WordPresses. Are you WordPress enough? Can you handle WordPress? WordPress!
					</p>
				</Card>
			</div>
		);
	}
} );

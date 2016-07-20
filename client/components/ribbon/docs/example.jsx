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
					<a href="/devdocs/design/ribbon">Ribbon</a>
				</h2>
				<Card>
					<Ribbon>Default</Ribbon>
					<p>
						Ribbon is a component you can slap on a Card or a similar container to ditinguish it in some way.
						You can just render <b>&lt;Ribbon&gt;Text&lt;/Ribbon&gt;</b> inside to have it marked.
					</p>
				</Card>
				<Card>
					<Ribbon>History</Ribbon>
					<p>
						Ribbons came to us in the early 2010s when they were put on every container on the web.
						Since then, the internet's love for ribbons have subsided, but they will always find a place in our hearts.
					</p>
				</Card>
				<Card>
					<Ribbon color="green">Green</Ribbon>
					<p>
						There are additional color versions.&nbsp;
						You can change them by passing color prop. The ribbon you can see on the right side is rendered by
						<b>&lt;Ribbon color="green"&gt;Green&lt;/Ribbon&gt;</b>
					</p>
				</Card>
			</div>
		);
	}
} );

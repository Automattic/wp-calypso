/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import TermTreeSelector from '../';
import observe from 'lib/mixins/data-observe';
import sites from 'lib/sites-list';

const TermTreeSelectorExample = React.createClass( {
	mixins: [ observe( 'sites' ), PureRenderMixin ],

	render() {
		const primary = this.props.sites.getPrimary();

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/term-tree-selector">Term Tree Selector</a>
				</h2>
				<div style={ { width: 300 } }>
					{ this.props.sites.initialized && (
						<TermTreeSelector
							siteId={ primary ? primary.ID : 3584907 }
							taxonomy="category" />
					) }
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
} );

export default React.createClass( {
	displayName: 'TermTreeSelector',

	mixins: [ PureRenderMixin ],

	render() {
		return <TermTreeSelectorExample sites={ sites() } />;
	}
} );

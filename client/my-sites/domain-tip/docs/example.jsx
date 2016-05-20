/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DomainTip from '../index';
import sitesList from 'lib/sites-list';

const sites = sitesList();
const siteId = sites.getPrimary().ID;

export default React.createClass( {

	displayName: 'DomainTip',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/domain-tip">Domain Tip</a>
				</h2>
				<div>
					<DomainTip siteId={ siteId } />
				</div>
			</div>
		);
	}
} );

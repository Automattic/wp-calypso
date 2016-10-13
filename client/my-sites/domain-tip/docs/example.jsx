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

export default React.createClass( {

	displayName: 'DomainTip',

	mixins: [ PureRenderMixin ],

	render() {
		const primarySite = sites.initialized && sites.getPrimary();
		const siteId = primarySite ? primarySite.ID : 0;

		return <DomainTip siteId={ siteId } event="domain_app_example" />;
	}
} );

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SeoForm from 'my-sites/site-settings/form-seo';

export default React.createClass( {
	displayName: 'SiteSettingsSeo',

	render() {
		const { site, upgradeToBusiness } = this.props;
		return (
			<SeoForm { ...{ site, upgradeToBusiness } } />
		);
	}
} );

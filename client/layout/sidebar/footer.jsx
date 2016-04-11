/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import localize from 'lib/mixins/i18n/localize';

const SidebarFooter = ( { translate, children } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button compact borderless href="/help">
			{ translate( 'Help' ) }
		</Button>
	</div>
);

export default localize( SidebarFooter );

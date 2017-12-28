/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import NavItem from 'client/components/section-nav/item';
import NavTabs from 'client/components/section-nav/tabs';
import SectionNav from 'client/components/section-nav';
import { sanitizeSectionContent } from 'client/lib/plugins/utils';

const PluginSectionsCustom = ( { plugin, translate } ) => {
	const description = sanitizeSectionContent( plugin.description );
	if ( ! description.length ) {
		return null;
	}

	return (
		<div className="plugin-sections__custom plugin-sections">
			<div className="plugin-sections__header">
				<SectionNav selectedText={ translate( 'Description' ) }>
					<NavTabs>
						<NavItem selected>{ translate( 'Description' ) }</NavItem>
					</NavTabs>
				</SectionNav>
			</div>
			<Card>
				<div
					className="plugin-sections__content"
					dangerouslySetInnerHTML={ { __html: description } } // eslint-disable-line react/no-danger
				/>
			</Card>
		</div>
	);
};

export default localize( PluginSectionsCustom );

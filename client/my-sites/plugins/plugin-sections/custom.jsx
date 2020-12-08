/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SectionNav from 'calypso/components/section-nav';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';

/**
 * Style dependencies
 */
import './style.scss';

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

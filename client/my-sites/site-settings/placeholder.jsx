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
import Main from 'client/components/main';
import NavItem from 'client/components/section-nav/item';
import NavTabs from 'client/components/section-nav/tabs';
import SectionHeader from 'client/components/section-header';
import SectionNav from 'client/components/section-nav';

const Placeholder = ( { translate } ) => {
	const header = <div className="site-settings__placeholder-item">General Settings</div>;

	return (
		<Main className="site-settings__placeholder">
			<SectionNav>
				<NavTabs>
					<NavItem>
						<span className="site-settings__placeholder-item">{ translate( 'General' ) }</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">{ translate( 'Writing' ) }</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">{ translate( 'Discussion' ) }</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">{ translate( 'Traffic' ) }</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">{ translate( 'Security' ) }</span>
					</NavItem>
				</NavTabs>
			</SectionNav>

			<SectionHeader label={ header } />

			<Card>
				<div className="site-settings__placeholder-item">Example content here</div>
				<div className="site-settings__placeholder-item">
					Example content here<br />
					Example content here<br />
					Example content here
				</div>
				<div className="site-settings__placeholder-item">
					Example content here<br />
					Example content here
				</div>
			</Card>
		</Main>
	);
};

export default localize( Placeholder );

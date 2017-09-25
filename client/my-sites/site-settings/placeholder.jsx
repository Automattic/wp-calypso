/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';

const Placeholder = ( { translate } ) => {
	const header = (
		<div className="site-settings__placeholder-item">
			General Settings
		</div>
	);

	return (
		<Main className="site-settings__placeholder">
			<SectionNav>
				<NavTabs>
					<NavItem>
						<span className="site-settings__placeholder-item">
							{ translate( 'General' ) }
						</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">
							{ translate( 'Writing' ) }
						</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">
							{ translate( 'Discussion' ) }
						</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">
							{ translate( 'Traffic' ) }
						</span>
					</NavItem>
					<NavItem>
						<span className="site-settings__placeholder-item">
							{ translate( 'Security' ) }
						</span>
					</NavItem>
				</NavTabs>
			</SectionNav>

			<SectionHeader label={ header } />

			<Card>
				<div className="site-settings__placeholder-item">
					Example content here
				</div>
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

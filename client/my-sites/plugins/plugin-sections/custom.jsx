import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';

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

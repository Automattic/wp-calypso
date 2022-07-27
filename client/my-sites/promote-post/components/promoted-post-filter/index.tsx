import { translate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import './style.scss';

export default function PromotedPostFilter() {
	return (
		<SectionNav
			selectedText={ translate( 'All' ) }
			selectedCount={ 3 } // todo
		>
			<NavTabs label={ translate( 'All' ) } selectedText={ 'All' } selectedCount={ 3 }>
				<NavItem key={ 'all' } count={ 3 } selected children={ 'All' } />
				<NavItem key={ 'live' } count={ 3 } children={ 'Live' } />
				<NavItem key={ 'finished' } count={ 3 } children={ 'Finished' } />
			</NavTabs>
		</SectionNav>
	);
}

import { useTranslate } from 'i18n-calypso';
import { navItems, NavItems } from 'calypso/blocks/stats-navigation/constants';
import NavigationHeader from 'calypso/components/navigation-header';
import { preventWidows } from 'calypso/lib/formatting';

interface StatsPageHeaderProps {
	page: keyof NavItems;
	subHeaderText?: string;
}

export default function StatsPageHeader( { page, subHeaderText }: StatsPageHeaderProps ) {
	const translate = useTranslate();

	return (
		<NavigationHeader
			title={ preventWidows( translate( 'Jetpack Stats' ), 2 ) }
			subtitle={ preventWidows( subHeaderText, 2 ) }
		>
			<h2 className="screen-reader-text">{ navItems[ page ]?.label }</h2>
		</NavigationHeader>
	);
}

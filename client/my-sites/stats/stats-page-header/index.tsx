import { useTranslate } from 'i18n-calypso';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';

interface StatsPageHeaderProps {
	page: 'traffic' | 'insights' | 'store' | 'wordads' | 'googleMyBusiness' | 'subscribers';
	headerText: string;
	subHeaderText: string;
}

export default function StatsPageHeader( {
	page,
	headerText,
	subHeaderText,
}: StatsPageHeaderProps ) {
	const translate = useTranslate();

	return (
		<FormattedHeader
			align="left"
			brandFont
			className="stats__section-header modernized-header"
			headerText={ preventWidows( headerText ?? translate( 'Jetpack Stats' ), 2 ) } // This is the H1 header.
		>
			{ /*
				The secondary H2 header is only used for screen readers. This text should be identical to 
				the currently selected NavItem in StatsNavigation.
				*/ }
			<h2 className="screen-reader-text">{ navItems[ page ]?.label }</h2>
			<p className="formatted-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p>
		</FormattedHeader>
	);
}

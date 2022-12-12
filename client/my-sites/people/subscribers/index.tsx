import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import PeopleSectionNavCompact from '../people-section-nav-compact';

interface Props {
	filter: string;
	search?: string;
}
function Subscribers( props: Props ) {
	const _ = useTranslate();
	const { filter, search } = props;

	return (
		<Main>
			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ _( 'Users' ) }
				subHeaderText={ _( 'People who have subscribed to your site and team members.' ) }
				align="left"
				hasScreenOptions
			/>
			<div>
				<SectionNav>
					<PeopleSectionNavCompact selectedFilter={ filter } searchTerm={ search } />
				</SectionNav>
			</div>
		</Main>
	);
}

export default Subscribers;

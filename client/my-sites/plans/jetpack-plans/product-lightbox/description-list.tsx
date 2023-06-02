import { TranslateResult, translate } from 'i18n-calypso';

type DescriptionListProps = { items?: TranslateResult[]; comingSoon?: TranslateResult[] };

const DescriptionList: React.FC< DescriptionListProps > = ( { items, comingSoon } ) => {
	if ( ( ! items || ! items.length ) && ( ! comingSoon || ! comingSoon.length ) ) {
		return null;
	}

	return (
		<ul>
			{ comingSoon?.map( ( item, index ) => (
				<li className="is-coming-soon" key={ `coming-soon-${ index }` }>
					<b>{ translate( 'Coming soon:' ) }</b> { item }
				</li>
			) ) }

			{ items?.map( ( item, index ) => (
				<li key={ index }>{ item }</li>
			) ) }
		</ul>
	);
};
export default DescriptionList;

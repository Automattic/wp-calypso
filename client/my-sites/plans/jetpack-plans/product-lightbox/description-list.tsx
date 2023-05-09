import { TranslateResult } from 'i18n-calypso';

type DescriptionListProps = { items?: TranslateResult[] };
const DescriptionList: React.FC< DescriptionListProps > = ( { items } ) => {
	if ( ! items || ! items.length ) {
		return null;
	}

	return (
		<ul>
			{ items.map( ( item, index ) => (
				<li key={ index }>{ item }</li>
			) ) }
		</ul>
	);
};
export default DescriptionList;

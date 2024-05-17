import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SuggestionSearch from 'calypso/components/suggestion-search';
import { APIRewindStagingSiteInfo } from 'calypso/state/rewind/staging/types';
import './style.scss';
interface Props {
	loading: boolean;
	siteSuggestions: APIRewindStagingSiteInfo[];
	onSearchChange: ( newValue: string, isNavigating: boolean ) => void;
	onAddNewClick: () => void;
}

export default function CloneFlowSuggestionSearch( {
	loading,
	siteSuggestions,
	onSearchChange,
	onAddNewClick,
}: Props ) {
	const translate = useTranslate();

	const suggestions = siteSuggestions.map( ( site ) => {
		return {
			label: site.siteurl,
			category: 'Staging sites',
		};
	} );

	const addNewDestinationLabel = translate( 'Enter credentials for a new destination site' );

	const loadingPlaceholder = (
		<div className="loading">
			<div className="loading__placeholder" />
		</div>
	);

	const renderSuggestionSearch = (
		<>
			<SuggestionSearch
				placeholder={ translate( 'Search for a destination staging site' ) }
				suggestions={ suggestions }
				onChange={ onSearchChange }
			/>
			<div className="clone-flow-suggestion-search__add-new-button">
				<Button borderless onClick={ onAddNewClick }>
					{ addNewDestinationLabel }
					<Gridicon icon="plus-small" size={ 12 } />
				</Button>
			</div>
		</>
	);

	const render = () => {
		if ( loading ) {
			return loadingPlaceholder;
		}

		return renderSuggestionSearch;
	};

	return (
		<div className="clone-flow-suggestion-search">
			<Card className="clone-flow-suggestion-search__search-card">{ render() }</Card>
		</div>
	);
}

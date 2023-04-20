import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SuggestionSearch from 'calypso/components/suggestion-search';
import { APIRewindStagingSiteInfo } from 'calypso/state/rewind/staging/types';
import './style.scss';
interface Props {
	siteSuggestions: APIRewindStagingSiteInfo[];
	onSearchChange: ( newValue: string, isNavigating: boolean ) => void;
	onAddNewClick: () => void;
}

export default function CloneFlowSuggestionSearch( {
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

	return (
		<div className="clone-flow-suggestion-search">
			<Card className="clone-flow-suggestion-search__search-card">
				<SuggestionSearch
					placeholder={ translate( 'Search for a destination staging site' ) }
					suggestions={ suggestions }
					onChange={ onSearchChange }
				/>
				<div className="clone-flow-suggestion-search__add-new-button">
					<Button borderless={ true } onClick={ onAddNewClick }>
						{ addNewDestinationLabel }
						<Gridicon icon="plus-small" size={ 12 } />
					</Button>
				</div>
			</Card>
		</div>
	);
}

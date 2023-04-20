import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SuggestionSearch from 'calypso/components/suggestion-search';
import './style.scss';
import { APIRewindStagingSiteInfo } from 'calypso/state/rewind/staging/types';

interface Props {
	siteSuggestions: APIRewindStagingSiteInfo[];
	onSearchChange: ( newValue: string, isNavigating: boolean ) => void;
}

const addNewClicked = ( onSearchChange: ( newValue: string, isNavigating: boolean ) => void ) => {
	onSearchChange( 'new', true );
};

export default function CloneFlowSuggestionSearch( { siteSuggestions, onSearchChange }: Props ) {
	const translate = useTranslate();

	const suggestions = siteSuggestions.map( ( site ) => {
		return {
			label: site.siteurl,
			category: 'Staging sites',
		};
	} );

	return (
		<div className="clone-flow-suggestion-search">
			<Card className="clone-flow-suggestion-search__search-card">
				<SuggestionSearch
					placeholder={ translate( 'Search for a destination staging site' ) }
					suggestions={ suggestions }
					onChange={ onSearchChange }
				/>
				<Button
					className="clone-flow-suggestion-search__add-new-button"
					onClick={ () => {
						addNewClicked( onSearchChange );
					} }
				>
					{ translate( 'Enter credentials for a new destination site' ) }
				</Button>
			</Card>
		</div>
	);
}

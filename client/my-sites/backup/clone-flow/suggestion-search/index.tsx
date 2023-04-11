import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SuggestionSearch from 'calypso/components/suggestion-search';
import './style.scss';

interface Props {
	siteSuggestions: { label: string; category?: string }[];
	onSearchChange: ( newValue: string, isNavigating: boolean ) => void;
}

const addNewClicked = ( onSearchChange: ( newValue: string, isNavigating: boolean ) => void ) => {
	onSearchChange( 'new', true );
};

export default function CloneFlowSuggestionSearch( { siteSuggestions, onSearchChange }: Props ) {
	const translate = useTranslate();

	return (
		<div className="clone-flow-suggestion-search">
			<Card className="clone-flow-suggestion-search__search-card">
				<SuggestionSearch
					placeholder={ translate( 'Search for a destination staging site' ) }
					suggestions={ siteSuggestions }
					onChange={ onSearchChange }
				/>
				<Button
					className="clone-flow-suggestion-search__add-new-button"
					onClick={ () => {
						addNewClicked( onSearchChange );
					} }
				>
					{ translate( 'Add new' ) }
				</Button>
			</Card>
		</div>
	);
}

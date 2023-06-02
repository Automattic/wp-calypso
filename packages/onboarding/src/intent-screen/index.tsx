import { TranslateResult } from 'i18n-calypso';
import SelectItems, { SelectItem } from '../select-items';
import SelectItemsAlt, { SelectItemAlt } from '../select-items-alt';

interface Props< T > {
	intents: SelectItem< T >[];
	intentsAlt: SelectItemAlt< T >[];
	onSelect: ( value: T ) => void;
	preventWidows: ( text: TranslateResult, wordsToKeep?: number ) => string;
}

const IntentScreen = < T extends string >( {
	intents,
	intentsAlt,
	onSelect,
	preventWidows,
}: Props< T > ) => {
	return (
		<>
			<SelectItems items={ intents } onSelect={ onSelect } preventWidows={ preventWidows } />
			<SelectItemsAlt items={ intentsAlt } onSelect={ onSelect } />
		</>
	);
};

export default IntentScreen;

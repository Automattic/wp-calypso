import { TranslateResult } from 'i18n-calypso';
import SelectItems from './onboarding-components-select-items';
import SelectItemsAlt from './onboarding-components-select-items-alt';
import type { SelectItem, SelectAltItem } from '../types';

interface Props< T > {
	intents: SelectItem< T >[];
	intentsAlt: SelectAltItem< T >[];
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

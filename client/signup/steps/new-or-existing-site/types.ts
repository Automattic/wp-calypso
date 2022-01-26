import { TranslateResult } from 'i18n-calypso';

export type ChoiceType = 'new-site' | 'existing-site';

export type NewOrExistingSiteChoiceType = {
	type: ChoiceType;
	label: TranslateResult;
	imageUrl: string;
	description: TranslateResult;
};

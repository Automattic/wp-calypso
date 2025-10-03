import { useSupportStatus } from '@automattic/help-center/src/data/use-support-status';
import { useLocale } from '@automattic/i18n-utils';
import { isDIFMFlow } from '@automattic/onboarding';

export default function useShouldRenderHelpCenterButton( {
	flowName,
	enabledLocales,
}: {
	flowName: string;
	enabledLocales?: string[];
} ) {
	const locale = useLocale();
	const { data: supportStatus } = useSupportStatus();

	if ( isDIFMFlow( flowName ) ) {
		if ( ! supportStatus?.availability.is_difm_chat_open ) {
			return false;
		}
	}

	if ( ! locale || ! enabledLocales?.includes( locale ) ) {
		return false;
	}

	return true;
}

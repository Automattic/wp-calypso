import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import HundredYearPlanLogo from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/hundred-year-plan-step-wrapper/hundred-year-plan-logo';

export const HundredYearPromo = () => {
	const { __ } = useI18n();

	return (
		<VStack spacing={ 4 }>
			<HundredYearPlanLogo color="var( --domain-search-secondary-action-color )" />
			<Text size="small">
				{ __(
					'.com, .net, .org, or .blog domains can now be registered for 100 years with one-time payment during checkout.'
				) }
			</Text>
		</VStack>
	);
};

import { __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const FreeDomainForAYearPromo = () => {
	const { __ } = useI18n();

	return (
		<Text>
			{ __( 'Get your free domain when you checkout and purchase any paid annual plan.' ) }
		</Text>
	);
};

import {
	Icon,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { chevronRight, globe } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

import './styles.scss';

interface Props {
	onClick: () => void;
}

export const DomainOwnUse = ( { onClick }: Props ) => {
	const { __ } = useI18n();

	return (
		<Button variant="secondary" className="domain-own-use" onClick={ onClick }>
			<HStack spacing={ 4 } justify="flex-start" alignment="flex-start" as="span">
				<span className="domain-own-use__decoration">
					<Icon icon={ globe } />
				</span>
				<HStack justify="space-between" spacing={ 4 } as="span" wrap>
					<VStack alignment="flex-start" as="span" spacing={ 3 } justify="flex-start">
						<VStack alignment="flex-start" as="span" spacing={ 2 } justify="flex-start">
							<Text className="domain-own-use__title">{ __( 'Already have a domain?' ) }</Text>

							<Text variant="muted" className="domain-own-use__description">
								{ __( 'Connect a domain you already own to WordPress.com.' ) }
							</Text>
						</VStack>
					</VStack>
				</HStack>
				<Icon icon={ chevronRight } />
			</HStack>
		</Button>
	);
};

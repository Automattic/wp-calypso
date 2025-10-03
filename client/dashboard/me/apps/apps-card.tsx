import { __experimentalVStack as VStack, Card, CardBody } from '@wordpress/components';
import { Text } from '../../components/text';
import type { CSSProperties } from 'react';

type AppsCardProps = {
	logo: string;
	logoAlt: string;
	title: string;
	description: React.ReactNode;
	children?: React.ReactNode;
};

export default function AppsCard( { logo, logoAlt, title, description, children }: AppsCardProps ) {
	return (
		<Card>
			<CardBody style={ { padding: '24px' } }>
				<VStack spacing={ 6 }>
					<VStack spacing={ 4 }>
						<img src={ logo } alt={ logoAlt } width={ 64 } height={ 64 } />
						<VStack spacing={ 2 }>
							<Text as="h2" size="15px" weight={ 500 } lineHeight="20px">
								{ title }
							</Text>
							<Text
								as="p"
								variant="muted"
								lineHeight="20px"
								style={ { textWrap: 'balance' } as CSSProperties }
							>
								{ description }
							</Text>
						</VStack>
					</VStack>
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);
}

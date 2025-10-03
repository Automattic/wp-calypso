import { __experimentalHStack as HStack, Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import AIIcon from 'calypso/assets/images/performance-profiler/ai-icon.svg';
import AILoadingIcon from 'calypso/assets/images/performance-profiler/ai-loading-icon.svg';
import { Text } from '../../components/text';
import type { ReactNode } from 'react';

const LLMNotice = ( {
	children,
	isLoading,
	actions,
}: {
	children: ReactNode;
	isLoading?: boolean;
	actions?: ReactNode;
} ) => {
	return (
		<Card
			size="xSmall"
			style={ {
				background:
					'linear-gradient(0deg,#fffffff2,#fffffff2),linear-gradient(90deg,#4458e4,#069e08)',
			} }
		>
			<CardBody>
				<HStack>
					<HStack
						className={ clsx( 'llm-notice', { 'is-loading': isLoading } ) }
						justify="flex-start"
						spacing={ 1 }
					>
						<img
							src={ isLoading ? AILoadingIcon : AIIcon }
							alt={ __( 'AI generated content icon' ) }
						/>
						<Text>{ children }</Text>
					</HStack>
					{ actions && (
						<HStack justify="flex-end" alignment="center">
							{ actions }
						</HStack>
					) }
				</HStack>
			</CardBody>
		</Card>
	);
};

export default LLMNotice;

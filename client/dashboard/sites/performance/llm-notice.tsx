import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import AIIcon from 'calypso/assets/images/performance-profiler/ai-icon.svg';
import AILoadingIcon from 'calypso/assets/images/performance-profiler/ai-loading-icon.svg';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { Text } from '../../components/text';
import { VIEWPORT_BREAKPOINTS } from './constants';
import type { ReactNode } from 'react';

import './llm-notice.scss';

const LLMNotice = ( {
	children,
	isLoading,
	actions,
}: {
	children: ReactNode;
	isLoading?: boolean;
	actions?: ReactNode;
} ) => {
	const isMediumScreen = useViewportMatch( VIEWPORT_BREAKPOINTS.medium, '<' );

	return (
		<Card className="llm-notice-card" size="xSmall">
			<CardBody>
				<HStack
					direction={ isMediumScreen ? 'column' : 'row' }
					alignment={ isMediumScreen ? 'flex-start' : 'center' }
				>
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
						<ButtonStack
							justify="flex-end"
							alignment="center"
							expanded={ false }
							style={ { flexShrink: 0 } }
						>
							{ actions }
						</ButtonStack>
					) }
				</HStack>
			</CardBody>
		</Card>
	);
};

export default LLMNotice;

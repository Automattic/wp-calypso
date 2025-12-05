import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import InlineSupportLink from '../../../components/inline-support-link';
import SegmentedBar, { type SegmentedBarSegment } from '../../../components/segmented-bar';
import { Text } from '../../../components/text';
import type { ReactNode } from 'react';

interface InboundTransferStepProps {
	icon: ReactNode;
	title: string;
	badge?: ReactNode;
	subtitle?: ReactNode;
	progress: { currentStep: number; color: string };
	children: React.ReactNode;
}

const segment = ( step: number, currentStep: number, color: string ): SegmentedBarSegment => {
	return {
		id: step.toString(),
		value: 33,
		color: currentStep >= step ? color : 'var(--dashboard-header__divider-color)',
	};
};

export const InboundTransferStep = ( {
	icon,
	title,
	badge,
	subtitle,
	progress,
	children,
}: InboundTransferStepProps ) => {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<VStack spacing={ 3 }>
						<HStack spacing={ 2 } justify="flex-start" alignment="left" expanded={ false }>
							{ icon }
							<Text size={ 15 }>{ title }</Text>
							{ badge }
						</HStack>
						{ subtitle && <Text variant="muted">{ subtitle }</Text> }
					</VStack>
					<SegmentedBar
						style={ {
							// @ts-expect-error -- Custom CSS variable.
							'--segmented-bar-bg': 'transparent',
						} }
						gap={ 8 }
						radius={ 4 }
						height={ 4 }
						roundedSegments
						segments={ [
							segment( 1, progress.currentStep, progress.color ),
							segment( 2, progress.currentStep, progress.color ),
							segment( 3, progress.currentStep, progress.color ),
						] }
						showLabels={ false }
					/>
					<div>{ children }</div>
					<VStack spacing={ 4 }>
						<Text size="medium" weight={ 500 }>
							{ __( 'Need help?' ) }
						</Text>
						<VStack spacing={ 2 }>
							<InlineSupportLink supportContext="transfer-domain-registration">
								{ __( 'Domain name transfer guide' ) }
							</InlineSupportLink>
							<InlineSupportLink supportContext="general-support-options">
								{ __( 'Contact support' ) }
							</InlineSupportLink>
						</VStack>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
};

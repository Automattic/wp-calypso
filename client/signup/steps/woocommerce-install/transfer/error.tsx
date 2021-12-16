import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import WarningCard from 'calypso/components/warning-card';
import StepContent from './step-content';

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

export default function Error( { message }: { message: string } ): ReactElement {
	const { __ } = useI18n();
	// todo: both messages sort of say the same thing, refer to figma and fix
	return (
		<StepContent
			title={ __( "We've hit a snag" ) }
			subtitle={ __(
				'It looks like something went wrong while setting up your store. If this is unexpected, please contact support so that we can help you out.'
			) }
		>
			<WarningsOrHoldsSection>
				<WarningCard
					message={
						message ||
						__(
							'There is an error that is stopping us from being able to install this product, please contact support.'
						)
					}
				/>
			</WarningsOrHoldsSection>
		</StepContent>
	);
}

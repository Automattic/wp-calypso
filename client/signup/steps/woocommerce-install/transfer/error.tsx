import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { SupportLink } from '../confirm';
import StepContent from './step-content';

const WarningsOrHoldsSection = styled.div`
	margin-top: 40px;
`;

export default function Error(): ReactElement {
	const { __ } = useI18n();
	// todo: both messages sort of say the same thing, refer to figma and fix
	return (
		<StepContent
			title={ __( "We've hit a snag" ) }
			subtitle={ __(
				'It looks like something went wrong while setting up your store. Please contact support so that we can help you out.'
			) }
		>
			<WarningsOrHoldsSection>
				<SupportLink />
			</WarningsOrHoldsSection>
		</StepContent>
	);
}

import { Card, FormLabel } from '@automattic/components';
import styled from '@emotion/styled';
import FormTextInput from 'calypso/components/forms/form-text-input';

const propForwardFilter = ( prop: string ) => prop !== 'currentViewport';
export type Viewport = 'desktop' | 'mobile' | 'tablet';

type PropsWithViewport = { currentViewport: Viewport };

export const SurveyFormContainer = styled( 'div', {
	shouldForwardProp: propForwardFilter,
} )`
	margin: 0
		${ ( { currentViewport }: PropsWithViewport ) =>
			currentViewport === 'desktop' ? 'auto' : '10px' };
	margin-bottom: 15px;
`;

export const StyledCard = styled( Card, {
	shouldForwardProp: propForwardFilter,
} )`
	margin: 0 auto;
	padding: 25px 30px;
	display: flex;
	justify-content: center;
	width: ${ ( props: PropsWithViewport ) =>
		props.currentViewport === 'mobile' ? '100%' : 'fit-content' };
	min-width: ${ ( props: PropsWithViewport ) =>
		props.currentViewport === 'mobile' ? 'unset' : '459px' };
`;

export const StyledLabel = styled( FormLabel )`
	&.form-label.form-label {
		min-height: 32px;
		display: flex;
		align-items: center;
	}
`;

export const StyledFormTextInput = styled( FormTextInput )`
	&.form-text-input.form-text-input {
		margin-left: 24px;
		max-width: 385px;
		font-size: 100%;
	}
`;

export const CardContent = styled.div`
	width: 100%;
`;

export const OptionsContainer = styled.div`
	padding: 0 20px;
`;

export const ButtonContainer = styled.div`
	text-align: center;
	padding-bottom: 10px;
	padding-top: 10px;
`;

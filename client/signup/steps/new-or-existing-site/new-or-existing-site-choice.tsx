import { Button, Card } from '@automattic/components';
import styled from '@emotion/styled';
import { NewOrExistingSiteChoiceType, ChoiceType } from './types';

interface Props {
	choice: NewOrExistingSiteChoiceType;
	onSelect: ( value: ChoiceType ) => void;
}

const ChoiceContainer = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	text-align: center;
	width: 100%;

	@media ( max-width: 480px ) {
		margin: 12px;
	}
`;

const ChoiceImage = styled( Card )`
	width: 100%;

	@media ( max-width: 480px ) {
		display: none;
	}
`;

const ChoiceButtion = styled( Button )`
	border-radius: 4px;
	box-shadow: 0 1px 2px rgba( 0, 0, 0, 0.05 );
	color: #101517;
	font-weight: 500;
	margin-top: 0.5rem;
	min-width: 130px;
`;

const ChoiceSection = styled( Card )`
	flex-grow: 1;
`;

const ChoiceDescription = styled.div`
	margin: 1.5em 0;
`;

export default function NewOrExistingSiteChoice( props: Props ): React.ReactElement {
	const handleClickChoice = () => {
		props.onSelect( props.choice.type );
	};

	return (
		<ChoiceContainer data-e2e-type={ props.choice.type } key={ props.choice.type }>
			<ChoiceImage compact>{ props.choice.image }</ChoiceImage>
			<ChoiceSection compact>
				<div>
					<ChoiceButtion onClick={ handleClickChoice }>{ props.choice.label }</ChoiceButtion>
				</div>
				<ChoiceDescription>{ props.choice.description }</ChoiceDescription>
			</ChoiceSection>
		</ChoiceContainer>
	);
}

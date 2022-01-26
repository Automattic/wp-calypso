import styled from '@emotion/styled';
import { NewOrExistingSiteChoiceType, ChoiceType } from './types';

interface Props {
	choice: NewOrExistingSiteChoiceType;
	onSelect: ( value: ChoiceType ) => void;
}

const ChoiceContainer = styled.div`
	border: 1px solid #c3c4c7;
	box-sizing: border-box;
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 4px;
	cursor: pointer;
	display: flex;
	flex: 1;
	gap: 30px;
	padding: 32px;
	width: 100%;

	&:hover,
	&:focus-within {
		border-color: var( --studio-gray-60 );
	}
`;

const ChoiceImage = styled.img`
	display: none;
	width: 96px;
	@media ( min-width: 960px ) {
		display: block;
	}
`;

const ChoiceTitle = styled.div`
	color: #101517;
	font-size: 16px;
	line-height: 19px;
	letter-spacing: 0.38px;
`;

const ChoiceDescription = styled.div`
	color: var( --studio-gray-50 );
	margin: 1.5em 0;
`;

export default function NewOrExistingSiteChoice( props: Props ): React.ReactElement {
	const handleClickChoice = () => {
		props.onSelect( props.choice.type );
	};

	return (
		<ChoiceContainer
			data-e2e-type={ props.choice.type }
			key={ props.choice.type }
			onClick={ handleClickChoice }
		>
			<ChoiceImage src={ props.choice.imageUrl }></ChoiceImage>
			<div>
				<ChoiceTitle>{ props.choice.label }</ChoiceTitle>
				<ChoiceDescription>{ props.choice.description }</ChoiceDescription>
			</div>
		</ChoiceContainer>
	);
}

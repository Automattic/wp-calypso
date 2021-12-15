import { Button, Card } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { NewOrExistingSiteChoiceType, ChoiceType } from './types';

interface Props {
	choice: NewOrExistingSiteChoiceType;
	onSelect: ( value: ChoiceType ) => void;
}

const ChoiceContainer = styled.div`
	flex: 1;
	text-align: center;
	@media ( max-width: 480px ) {
		margin: 12px;
	}
`;

const ChoiceDescription = styled.p`
	margin: 1.5em 0;
`;

export default function NewOrExistingSiteChoice( props: Props ): React.ReactElement {
	const handleClickChoice = () => {
		props.onSelect( props.choice.type );
	};

	return (
		<ChoiceContainer data-e2e-type={ props.choice.type } key={ props.choice.type }>
			<Card
				compact
				css={ css`
					@media ( max-width: 480px ) {
						display: none;
					}
				` }
			>
				{ props.choice.image }
			</Card>
			<Card compact>
				<div>
					<Button
						css={ css`
							border-radius: 4px;
							margin-top: 0.5rem;
							min-width: 130px;
							box-shadow: 0 1px 2px rgba( 0, 0, 0, 0.05 );
							color: #101517;
							font-weight: 500;
						` }
						onClick={ handleClickChoice }
					>
						{ props.choice.label }
					</Button>
				</div>
				<ChoiceDescription>{ props.choice.description }</ChoiceDescription>
			</Card>
		</ChoiceContainer>
	);
}

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
	margin: 12px;
	text-align: center;
`;

const ChoiceDescription = styled.p`
	margin: 1.5em 0;
`;

export default function NewOrExistingSiteChoice( props: Props ): React.ReactElement {
	const handleClickChoice = () => {
		props.onSelect( props.choice.type );
	};

	return (
		<ChoiceContainer
			className="new-or-existing-site__choice"
			data-e2e-type={ props.choice.type }
			key={ props.choice.type }
		>
			<Card compact className="new-or-existing-site__choice-image">
				{ props.choice.image }
			</Card>
			<Card compact className="new-or-existing-site__choice-text">
				<div className="new-or-existing-site__choice-button">
					<Button
						css={ css`
							border-radius: 4px; /* stylelint-disable-line */
							margin-top: 0.5rem;
							min-width: 130px;
							box-shadow: 0 1px 2px rgba( 0, 0, 0, 0.05 );
							color: #101517;
							font-weight: 500; /* stylelint-disable-line scales/font-weights */
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

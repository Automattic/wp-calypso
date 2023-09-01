import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { hasDIFMProduct } from 'calypso/lib/cart-values/cart-items';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';
interface Props {
	responseCart: ResponseCart;
	headerText?: TranslateResult;
}

interface NextStepsStep {
	text: TranslateResult;
	icon: JSX.Element;
}

const CheckoutNextStepsWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 0;
	padding: 20px;
`;

const CheckoutNextStepsHeader = styled.h3`
	font-size: 14px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	margin-bottom: 16px;
`;

const CheckoutNextStepsListWrapper = styled.ul`
	margin: 0;
	list-style: none;
	font-size: 14px;
`;

const CheckoutNextStepsListItem = styled( 'li' )`
	margin-bottom: 4px;
	overflow-wrap: break-word;
	display: flex;
	align-items: flex-start;
	margin-bottom: 12px;
	gap: 8px;
`;

const BaseIcon = styled.div`
	background: ${ ( props ) => props.theme.colors.success };
	border-radius: 50%;
	border: 1px solid;
	border-color: ${ ( props ) => props.theme.colors.success };
	height: 18px;
	width: 18px;
	text-align: center;
	flex-shrink: 0;

	.gridicon {
		fill: ${ ( props ) => props.theme.colors.surface };
	}
`;

const CompletedStepIcon = () => (
	<BaseIcon>
		<Gridicon icon="checkmark" size={ 12 } />
	</BaseIcon>
);

const CurrentStepIcon = styled( BaseIcon )`
	background: ${ ( props ) =>
		`linear-gradient(0, ${ props.theme.colors.success } 50%, ${ props.theme.colors.surface } 50%)` };
`;

const NextStepIcon = styled( BaseIcon )`
	background-color: ${ ( props ) => props.theme.colors.surface };
`;

export default function CheckoutNextSteps( { responseCart, headerText }: Props ) {
	const translate = useTranslate();

	const steps: NextStepsStep[] = useMemo( () => {
		if ( hasDIFMProduct( responseCart ) ) {
			return [
				{
					text: translate( 'Submit business information' ),
					icon: <CompletedStepIcon />,
				},
				{
					text: translate( 'Choose a design' ),
					icon: <CompletedStepIcon />,
				},
				{
					text: <b>{ translate( 'Checkout' ) }</b>,
					icon: <CurrentStepIcon />,
				},
				{
					text: translate( 'Submit content for new site' ),
					icon: <NextStepIcon />,
				},
				{
					text: translate( 'Receive your finished site in %d business days or less!', {
						args: [ 4 ],
					} ),
					icon: <NextStepIcon />,
				},
			];
		}
		return [];
	}, [ responseCart, translate ] );

	return steps && steps.length ? (
		<CheckoutNextStepsWrapper>
			<CheckoutNextStepsHeader>
				{ headerText || translate( "What's Next" ) }
			</CheckoutNextStepsHeader>
			<CheckoutNextStepsListWrapper>
				{ steps.map( ( step, index ) => (
					<CheckoutNextStepsListItem key={ index.toString() }>
						{ step.icon }
						{ step.text }
					</CheckoutNextStepsListItem>
				) ) }
			</CheckoutNextStepsListWrapper>
		</CheckoutNextStepsWrapper>
	) : null;
}

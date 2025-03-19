import styled from '@emotion/styled';
import { useTranslate, TranslateResult } from 'i18n-calypso';

const ServiceDescription = styled.div`
	display: flex;
	flex-direction: column;
	gap: 32px;
`;

const Title = styled.div`
	margin-bottom: 6px;
	color: var( --studio-gray-100 );
	font-weight: 500;
`;
const Description = styled.div`
	color: var( --studio-gray-60 );
	padding-bottom: 18px;
	font-size: 0.875rem;
`;

const StepContainer = styled.div`
	display: flex;
	gap: 20px;
	margin-top: 0;
`;

const ProgressLine = styled.div`
	width: 1px;
	background: var( --studio-gray-5 );
	height: 100%;
`;

const VerticalStepProgress = styled.div`
	display: flex;
	flex-direction: column;
	${ StepContainer }:last-child {
		${ ProgressLine } {
			display: none;
		}
		${ Description } {
			padding-bottom: 0;
		}
	}
`;

const IndexContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Index = styled.div`
	border-radius: 50%;
	border: 1px solid var( --studio-gray-5 );
	color: var( --studio-gray-30 );
	font-size: 1.125rem;
	height: 20px;
	line-height: 20px;
	padding: 10px;
	text-align: center;
	width: 20px;
`;

const Step = ( {
	index,
	title,
	description,
}: {
	index: TranslateResult;
	title: TranslateResult;
	description: TranslateResult;
} ) => {
	return (
		<StepContainer>
			<IndexContainer>
				<Index>{ index }</Index>
				<ProgressLine />
			</IndexContainer>
			<div>
				<Title>{ title }</Title>
				<Description>{ description }</Description>
			</div>
		</StepContainer>
	);
};

export const DIFMServiceDescription = ( { isStoreFlow }: { isStoreFlow: boolean } ) => {
	const translate = useTranslate();

	return (
		<ServiceDescription>
			<VerticalStepProgress>
				<Step
					index={ translate( '1' ) }
					title={ translate( 'Submit your business information' ) }
					description={ translate( 'Optionally provide your profiles to be found on social.' ) }
				/>

				<Step
					index={ translate( '2' ) }
					title={ translate( 'Select your design and pages' ) }
					description={ translate( 'Can’t decide? Let our experts choose the best design!' ) }
				/>

				<Step
					index={ translate( '3' ) }
					title={ translate( 'Complete the purchase' ) }
					description={ translate( 'Try risk free with a %(days)d-day money back guarantee.', {
						args: {
							days: 14,
						},
						comment: 'the arg is the refund period in days',
					} ) }
				/>

				<Step
					index={ translate( '4' ) }
					title={ translate( 'Submit content for your new website' ) }
					description={
						isStoreFlow
							? translate( 'Products can be added later with the WordPress editor.' )
							: translate( 'Content can be edited later with the WordPress editor.' )
					}
				/>
			</VerticalStepProgress>
			<p>
				{ translate( 'Share your finished site with the world in %(days)d business days or less!', {
					args: {
						days: 4,
					},
				} ) }
			</p>
		</ServiceDescription>
	);
};

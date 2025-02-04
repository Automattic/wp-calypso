import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate, useRtl } from 'i18n-calypso';
import { AccordionSectionProps } from './types';

interface AccordionFormSectionProps< T > extends AccordionSectionProps< T > {
	isExpanded: boolean;
	isTouched: boolean;
	showSubmit: boolean;
	onOpen: () => void;
	onNext: () => void;
	onSave: () => void;
	blockNavigation?: boolean;
	isSaving: boolean;
	hasUnsavedChanges: boolean;
}

interface SectionHeaderProps {
	isExpanded: boolean;
	isTouched: boolean;
	onClick: () => void;
	disabled?: boolean;
}

const Section = styled.div`
	border-bottom: 1px solid var( --studio-gray-5 );
	padding: 0 20px;
	@media ( min-width: 1280px ) {
		width: 775px;
	}
`;

const SectionHeader = styled.div< SectionHeaderProps >`
	align-items: center;
	display: flex;
	cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	font-weight: 500;
	font-size: ${ ( props ) => ( props.isExpanded ? '20px' : '16px' ) };
	line-height: 24px;
	gap: 10px;
	padding: 16px 0;
	color: ${ ( props ) =>
		props.isTouched ? 'var( --studio-gray-100 )' : 'var( --studio-gray-40 )' };
`;

const SectionContent = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0 0 36px 0;
	@media ( min-width: 1280px ) {
		padding-right: 96px;
		min-width: 675px;
	}
`;

const ButtonsContainer = styled.div`
	margin-top: 4px;
	align-items: center;
	display: flex;
	gap: 24px;
`;

const SkipLink = styled.a< { disabled?: boolean } >`
	font-size: 14px;
	line-height: 20px;
	color: var( --studio-gray-60 );
	text-decoration: none;
	cursor: ${ ( props ) => ( props.disabled ? 'default' : 'pointer' ) };
	pointer-events: ${ ( props ) => ( props.disabled ? 'none' : 'auto' ) };
`;

const RequiredLabel = styled.span`
	background: var( --studio-gray-0 );
	border-radius: 4px;
	color: var( --studio-gray-50 );
	font-weight: 500;
	font-size: 11px;
	line-height: 13px;
	letter-spacing: 0.38px;
	color: var( --studio-gray-50 );
	padding: 2px 8px;
	text-transform: uppercase;
`;

const SummaryLabel = styled( RequiredLabel )`
	margin-left: auto;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: right;
`;

const ActionButton = styled( Button )`
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 5px;
	padding: 10px 0;
	width: 177px;
	.gridicon {
		margin-left: 10px;
	}
`;

export default function AccordionFormSection< T >( props: AccordionFormSectionProps< T > ) {
	const translate = useTranslate();
	const isRTL = useRtl();

	return (
		<Section>
			<SectionHeader
				isExpanded={ props.isExpanded }
				isTouched={ props.isTouched }
				onClick={ () => ( props.blockNavigation ? null : props.onOpen() ) }
				disabled={ props.blockNavigation }
			>
				<span>{ props.title }</span>
				{ props.isExpanded && ! props.showSkip && (
					<RequiredLabel>{ translate( 'Required' ) }</RequiredLabel>
				) }
				{ ! props.isExpanded && props.summary && <SummaryLabel>{ props.summary }</SummaryLabel> }
			</SectionHeader>
			{ props.isExpanded && (
				<SectionContent>
					{ props.component ? props.component : props.children }
					<ButtonsContainer>
						<ActionButton
							onClick={ props.onSave }
							disabled={ props.blockNavigation || props.isSaving || ! props.hasUnsavedChanges }
						>
							{ props.isSaving ? translate( 'Saving' ) : translate( 'Save Changes' ) }
						</ActionButton>
						<ActionButton
							primary={ props.showSubmit }
							onClick={ props.onNext }
							disabled={ props.blockNavigation || props.isSaving }
						>
							{ props.showSubmit ? translate( 'Submit' ) : translate( 'Next' ) }
							{ ! props.showSubmit && <Gridicon icon={ isRTL ? 'arrow-left' : 'arrow-right' } /> }
						</ActionButton>
						{ props.showSkip && ! props.showSubmit && (
							<SkipLink
								disabled={ props.blockNavigation }
								onClick={ () => ( props.blockNavigation ? null : props.onNext() ) }
							>
								{ translate( 'Skip' ) }
							</SkipLink>
						) }
					</ButtonsContainer>
				</SectionContent>
			) }
		</Section>
	);
}

import { useEffect, useRef } from '@wordpress/element';
import { HelpCenterAskAIButton } from './help-center-ask-ai-button';
import { HelpCenterQuestionsDropdown } from './help-center-questions-dropdown';
import { HelpCenterTrianglePointer } from './help-center-triangle-pointer';
import { HelpCenterViewDocsButton } from './help-center-view-docs-button';

export type SelectionInfo = {
	text: string;
	rect: DOMRect;
	range: Range;
	documentation: string | null;
};

type HelpCenterTooltipProps = {
	selection: SelectionInfo;
	isVisible: boolean;
	showQuestions: boolean;
	questions: string[];
	isLoadingQuestions: boolean;
	onAskAI: () => void;
	onQuestionSelect: ( question: string ) => void;
	onViewDocs: () => void;
	onClose: () => void;
};

const calculateTooltipPosition = (
	selection: SelectionInfo,
	tooltipHeight: number,
	tooltipWidth: number,
	margin: number = 12
) => {
	const selectionCenter = selection.rect.left + selection.rect.width / 2;
	const selectionMiddle = selection.rect.top + selection.rect.height / 2;
	const spaceAbove = selection.rect.top;
	const spaceBelow = window.innerHeight - selection.rect.bottom;
	const spaceLeft = selection.rect.left;
	const spaceRight = window.innerWidth - selection.rect.right;

	let placement: 'above' | 'below' | 'left' | 'right' = 'below';

	if ( spaceAbove >= tooltipHeight + margin ) {
		placement = 'above';
	} else if ( spaceBelow >= tooltipHeight + margin ) {
		placement = 'below';
	} else if ( spaceRight >= tooltipWidth + margin ) {
		placement = 'right';
	} else if ( spaceLeft >= tooltipWidth + margin ) {
		placement = 'left';
	} else {
		placement = spaceBelow > spaceAbove ? 'below' : 'above';
	}

	let tooltipLeft: number;
	let tooltipTop: number;

	switch ( placement ) {
		case 'above':
			tooltipTop = selection.rect.top - tooltipHeight - margin;
			tooltipLeft = selectionCenter;
			break;
		case 'below':
			tooltipTop = selection.rect.bottom + margin;
			tooltipLeft = selectionCenter;
			break;
		case 'left':
			tooltipTop = selectionMiddle - tooltipHeight / 2;
			tooltipLeft = selection.rect.left - tooltipWidth - margin;
			break;
		case 'right':
			tooltipTop = selectionMiddle - tooltipHeight / 2;
			tooltipLeft = selection.rect.right + margin;
			break;
	}

	// Ensure tooltip stays within viewport bounds
	if ( placement === 'above' || placement === 'below' ) {
		const halfTooltipWidth = tooltipWidth / 2;
		if ( tooltipLeft - halfTooltipWidth < margin ) {
			tooltipLeft = halfTooltipWidth + margin;
		} else if ( tooltipLeft + halfTooltipWidth > window.innerWidth - margin ) {
			tooltipLeft = window.innerWidth - halfTooltipWidth - margin;
		}
		tooltipTop = Math.max(
			margin,
			Math.min( tooltipTop, window.innerHeight - tooltipHeight - margin )
		);
	} else {
		tooltipTop = Math.max(
			margin,
			Math.min( tooltipTop, window.innerHeight - tooltipHeight - margin )
		);
		if ( placement === 'left' ) {
			tooltipLeft = Math.max( margin, tooltipLeft );
		} else {
			tooltipLeft = Math.min( window.innerWidth - tooltipWidth - margin, tooltipLeft );
		}
	}

	return { tooltipLeft, tooltipTop, placement, selectionCenter };
};

export const HelpCenterTooltip = ( {
	selection,
	isVisible,
	showQuestions,
	questions,
	isLoadingQuestions,
	onAskAI,
	onQuestionSelect,
	onViewDocs,
	onClose,
}: HelpCenterTooltipProps ) => {
	const tooltipRef = useRef< HTMLDivElement | null >( null );

	// Calculate tooltip dimensions
	const baseTooltipHeight = selection.documentation ? 100 : 50;
	const questionsHeight = showQuestions ? questions.length * 48 + 16 : 0;
	const tooltipHeight = baseTooltipHeight + questionsHeight;
	const tooltipWidth = 280;
	const margin = 12;

	const { tooltipLeft, tooltipTop, placement, selectionCenter } = calculateTooltipPosition(
		selection,
		tooltipHeight,
		tooltipWidth,
		margin
	);

	// Triangle positioning
	const showTriangle =
		( placement === 'above' || placement === 'below' ) &&
		Math.abs( selectionCenter - tooltipLeft ) < tooltipWidth / 2;

	let triangleLeft = tooltipWidth / 2;
	if ( showTriangle ) {
		const tooltipLeftEdge = tooltipLeft - tooltipWidth / 2;
		triangleLeft = Math.max( 16, Math.min( tooltipWidth - 16, selectionCenter - tooltipLeftEdge ) );
	}

	// TODO: Move styles to a CSS file or styled component
	const tooltipStyle: React.CSSProperties = {
		position: 'fixed',
		left: tooltipLeft,
		top: tooltipTop,
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 0,
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
		border: '1px solid #e0e0e0',
		zIndex: 999999,
		opacity: isVisible ? 1 : 0,
		transform: ( () => {
			if ( isVisible ) {
				if ( placement === 'above' || placement === 'below' ) {
					return 'translateX(-50%) translateY(0) scale(1)';
				}
				return 'translateY(0) scale(1)';
			}
			if ( placement === 'above' || placement === 'below' ) {
				return 'translateX(-50%) translateY(-8px) scale(0.95)';
			}
			return 'translateY(-8px) scale(0.95)';
		} )(),
		transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
		minWidth: tooltipWidth,
		width: showQuestions && questions.length > 0 ? 'max-content' : tooltipWidth,
		overflow: 'hidden',
		maxHeight: '80vh',
		overflowY: 'auto',
	};

	useEffect( () => {
		const handleDocumentClick = ( event: MouseEvent ) => {
			if ( tooltipRef.current && ! tooltipRef.current.contains( event.target as Node ) ) {
				const windowSelection = window.getSelection();
				if ( ! windowSelection || windowSelection.toString().trim().length === 0 ) {
					onClose();
				}
			}
		};

		document.addEventListener( 'click', handleDocumentClick );
		return () => document.removeEventListener( 'click', handleDocumentClick );
	}, [ onClose ] );

	return (
		<div
			ref={ tooltipRef }
			style={ tooltipStyle }
			role="tooltip"
			aria-label="Text selection actions"
		>
			<HelpCenterTrianglePointer
				placement={ placement }
				showTriangle={ showTriangle }
				triangleLeft={ triangleLeft }
			/>

			<HelpCenterAskAIButton
				isLoadingQuestions={ isLoadingQuestions }
				showQuestions={ showQuestions }
				hasDocumentation={ !! selection.documentation }
				onClick={ onAskAI }
			/>

			{ showQuestions && questions.length > 0 && (
				<HelpCenterQuestionsDropdown
					questions={ questions }
					onQuestionSelect={ onQuestionSelect }
				/>
			) }

			{ selection.documentation && <HelpCenterViewDocsButton onClick={ onViewDocs } /> }
		</div>
	);
};

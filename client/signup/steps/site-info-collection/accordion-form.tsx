import AccordionFormSection from './accordion-form-section';
import { AccordionSectionProps, ValidatorFunction } from './types';

interface AccordionFormProps {
	sections: AccordionSectionProps[];
	currentIndex: number;
	isSectionAtIndexTouched: Record< string, boolean >;
	onNext: ( validator?: ValidatorFunction ) => void;
	onOpen: ( currentIndex: number ) => void;
}

export function AccordionForm( {
	sections,
	currentIndex,
	isSectionAtIndexTouched,
	onNext,
	onOpen,
}: AccordionFormProps ) {
	return (
		<>
			{ sections.map( ( section, index ) => (
				<AccordionFormSection
					key={ `${ index }` }
					title={ section.title }
					summary={ section.summary }
					isExpanded={ index === currentIndex }
					showSkip={ section.showSkip }
					component={ section.component }
					isTouched={ isSectionAtIndexTouched[ `${ index }` ] }
					onNext={ () => onNext( section.validate ) }
					onOpen={ () => onOpen( index ) }
				/>
			) ) }
		</>
	);
}

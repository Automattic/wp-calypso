import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import AccordionFormSection from './accordion-form-section';
import {
	AccordionSectionProps,
	SectionGeneratorReturnType,
	ValidationErrors,
	ValidatorFunction,
} from './types';

interface AccordionFormProps< T > {
	generatedSections?: AccordionSectionProps< T >[];
	sectionGenerator?: () => (
		props: SectionGeneratorReturnType< T >
	) => AccordionSectionProps< T >[];
	currentIndex: number;
	updateCurrentIndex: ( index: number ) => void;
	onSubmit: ( formValues: T ) => void;
	formValuesInitialState: T;
	updateFormValues?: ( formValues: T ) => void;
	onErrorUpdates?: ( errors: ValidationErrors ) => void;
}

export default function AccordionForm< T >( {
	currentIndex,
	updateCurrentIndex,
	updateFormValues,
	formValuesInitialState,
	sectionGenerator,
	onSubmit,
	generatedSections,
	onErrorUpdates,
}: AccordionFormProps< T > ) {
	const translate = useTranslate();
	// Initialize local state with the values from the redux store
	const [ formValues, setFormValues ] = useState< T >( formValuesInitialState );
	const onChangeField = ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => {
		setFormValues( {
			...formValues,
			[ name ]: value,
		} );
	};

	const [ formErrors, setFormErrors ] = useState< ValidationErrors >( {} );

	const isSectionAtIndexTouchedInitialState: Record< string, boolean > = {};
	for ( let i = 0; i <= currentIndex; i++ ) {
		isSectionAtIndexTouchedInitialState[ `${ i }` ] = true;
	}

	const [ isSectionAtIndexTouched, setIsSectionAtIndexTouched ] = useState<
		Record< string, boolean >
	>( isSectionAtIndexTouchedInitialState );

	const sections = sectionGenerator
		? sectionGenerator()( {
				translate,
				formValues,
				formErrors,
				onChangeField,
		  } )
		: generatedSections ?? [];

	const runValidatorAndSetFormErrors = ( validator: ValidatorFunction< T > ) => {
		const validationResult = validator( formValues );
		setFormErrors( {
			...formErrors,
			...validationResult.errors,
		} );
		onErrorUpdates &&
			onErrorUpdates( {
				...formErrors,
				...validationResult.errors,
			} );
		return validationResult;
	};

	const submitStep = () => {
		// Re-run validation on all sections before submitting
		for ( let index = 0; index < sections.length; index++ ) {
			const section = sections[ index ];
			if ( section.validate ) {
				const validationResult = runValidatorAndSetFormErrors( section.validate );
				if ( ! validationResult.result ) {
					updateCurrentIndex( index );
					return;
				}
			}
		}

		onSubmit( formValues );
	};

	const onOpen = ( currentIndex: number ) => {
		updateCurrentIndex( currentIndex );
		updateFormValues && updateFormValues( formValues );
		setIsSectionAtIndexTouched( { ...isSectionAtIndexTouched, [ `${ currentIndex }` ]: true } );
	};

	const onNext = ( validator?: ValidatorFunction< T > ) => {
		updateFormValues && updateFormValues( formValues );

		if ( validator ) {
			const validationResult = runValidatorAndSetFormErrors( validator );
			if ( ! validationResult.result ) {
				return;
			}
		}

		if ( currentIndex < sections.length - 1 ) {
			updateCurrentIndex( currentIndex + 1 );
			setIsSectionAtIndexTouched( {
				...isSectionAtIndexTouched,
				[ `${ currentIndex + 1 }` ]: true,
			} );
		} else {
			submitStep();
		}
	};

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

import React, { ReactElement, useState, JSXElementConstructor, useEffect } from 'react';

interface AccordionFormProps {
	initialOpenSectionId: string;
	isGoToNextAllowed: ( sectionID: string ) => boolean;
	onOpenCallback?: ( openedSectionId: string ) => void;
	onNextCallback?: ( openedSectionId: string ) => void;
	onSubmit: () => void;
	children: ReactElement< any, string | JSXElementConstructor< any > >[];
}

function getChildrenIds( elements: ReactElement< any, string | JSXElementConstructor< any > >[] ) {
	const eArray = React.Children.toArray( elements );

	const allIds = eArray.map( ( element ) => {
		return element.props.sectionId;
	} );
	return allIds;
}

export function AccordionForm( {
	children,
	onNextCallback,
	onSubmit,
	onOpenCallback,
	initialOpenSectionId,
	isGoToNextAllowed,
}: AccordionFormProps ) {
	const [ currentOpenSectionId, setCurrentOpenSectionId ] = useState< string >(
		initialOpenSectionId
	);
	let sectionIds: string[] = [];
	const onOpen = ( openedSectionId: string ) => {
		setCurrentOpenSectionId( openedSectionId );
		onOpenCallback && onOpenCallback( openedSectionId );
		return openedSectionId;
	};

	const onNext = ( opnedSectionId: string ) => {
		// This callback can be used to block the section from being passing on to the next
		if ( isGoToNextAllowed( opnedSectionId ) ) {
			const numericIndex = sectionIds.indexOf( opnedSectionId );
			//Within sections
			if ( numericIndex < sectionIds.length - 1 ) {
				const openedSectionId = sectionIds[ numericIndex + 1 ];
				setCurrentOpenSectionId( openedSectionId );
				onNextCallback && onNextCallback( openedSectionId );
			} else {
				//End of sections do nothing
				onSubmit();
			}
		}
		return currentOpenSectionId;
	};

	sectionIds = getChildrenIds( children );
	const [ firstSection ] = sectionIds;
	useEffect( () => {
		if ( initialOpenSectionId === '' && currentOpenSectionId === '' ) {
			setCurrentOpenSectionId( firstSection );
		} else if ( currentOpenSectionId === '' ) {
			setCurrentOpenSectionId( initialOpenSectionId );
		}
	}, [ initialOpenSectionId, currentOpenSectionId, firstSection ] );
	return (
		<>
			{ React.Children.map( children, ( child ) =>
				React.cloneElement( child, {
					...child.props,
					onOpen,
					onNext,
					isExpanded: child.props.sectionId === currentOpenSectionId,
				} )
			) }
		</>
	);
}

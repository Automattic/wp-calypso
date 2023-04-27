import { useLayoutEffect, useReducer } from 'react';

interface UseActionBarArguments {
	element: HTMLElement | null;
	sectionsLength: number;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
}

const useActionBarProps = ( {
	element,
	sectionsLength,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onDeleteHeader,
	onDeleteFooter,
}: UseActionBarArguments ) => {
	const patternType = element?.dataset.type ?? '';
	const position = Number( element?.dataset.position ?? 0 );
	const actionBarProps = { patternType };
	const [ , forceRecompute ] = useReducer( ( s ) => ( s + 1 ) % Number.MAX_SAFE_INTEGER, 0 );

	useLayoutEffect( () => {
		if ( ! element ) {
			return;
		}
		const observer = new window.MutationObserver( forceRecompute );
		observer.observe( element, { attributes: true } );

		return () => {
			observer.disconnect();
		};
	}, [ element, forceRecompute ] );

	if ( ! element ) {
		return null;
	}

	if ( patternType === 'header' ) {
		return { ...actionBarProps, onDelete: onDeleteHeader };
	}

	if ( patternType === 'footer' ) {
		return { ...actionBarProps, onDelete: onDeleteFooter };
	}

	return {
		...actionBarProps,
		disableMoveUp: position === 0,
		disableMoveDown: sectionsLength === position + 1,
		onDelete: () => onDeleteSection( position ),
		onMoveUp: () => onMoveUpSection( position ),
		onMoveDown: () => onMoveDownSection( position ),
	};
};

export default useActionBarProps;

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
	if ( ! element ) {
		return null;
	}

	const patternType = element.dataset.type;
	const position = Number( element.dataset.position );
	const actionBarProps = { patternType };

	if ( patternType === 'header' ) {
		return { ...actionBarProps, onDelete: onDeleteHeader };
	} else if ( patternType === 'footer' ) {
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

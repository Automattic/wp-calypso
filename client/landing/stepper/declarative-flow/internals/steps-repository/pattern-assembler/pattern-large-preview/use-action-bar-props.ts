import type { Pattern } from '../types';

export type ActionBarData = {
	type: string;
	element: HTMLElement;
};

export type ActionBarHandlers = {
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
};

const useActionBarProps = (
	sections: Pattern[],
	actionBarData: ActionBarData | null,
	actionBarHandlers: ActionBarHandlers
) => {
	if ( ! actionBarData ) {
		return null;
	}

	const { type, element } = actionBarData;
	const actionBarProps = { patternType: type };
	const position = Number( element.dataset.position );
	const { onDeleteSection, onMoveUpSection, onMoveDownSection, onDeleteHeader, onDeleteFooter } =
		actionBarHandlers;

	if ( type === 'header' ) {
		return { ...actionBarProps, onDelete: onDeleteHeader };
	} else if ( type === 'footer' ) {
		return { ...actionBarProps, onDelete: onDeleteFooter };
	}

	return {
		...actionBarProps,
		disableMoveUp: position === 0,
		disableMoveDown: sections.length === position + 1,
		onDelete: () => onDeleteSection( position ),
		onMoveUp: () => onMoveUpSection( position ),
		onMoveDown: () => onMoveDownSection( position ),
	};
};

export default useActionBarProps;

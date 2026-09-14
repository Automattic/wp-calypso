import { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { websiteContentFieldChanged } from 'calypso/state/signup/steps/website-content/actions';

export const useChangeHandlers = ( {
	pageId,
	onChangeField,
}: {
	pageId: string;
	onChangeField?: ( e: ChangeEvent< HTMLInputElement > ) => void;
} ) => {
	const dispatch = useDispatch();
	const onCheckboxChanged = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { name, checked },
		} = e;
		dispatch(
			websiteContentFieldChanged( {
				pageId,
				fieldName: name,
				fieldValue: !! checked,
			} )
		);
		onChangeField && onChangeField( e );
	};

	const onFieldChanged = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { name, value },
		} = e;
		dispatch(
			websiteContentFieldChanged( {
				pageId,
				fieldName: name,
				fieldValue: value,
			} )
		);
		onChangeField?.( e );
	};

	return {
		onCheckboxChanged,
		onFieldChanged,
	};
};

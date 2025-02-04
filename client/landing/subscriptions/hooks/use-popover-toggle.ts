import { useCallback, useState } from 'react';

const usePopoverToggle = () => {
	const [ showPopover, setShowPopover ] = useState( false );
	const onToggle = useCallback( () => setShowPopover( ! showPopover ), [ showPopover ] );
	const onClose = useCallback( () => setShowPopover( false ), [] );

	return { showPopover, onToggle, onClose };
};

export default usePopoverToggle;

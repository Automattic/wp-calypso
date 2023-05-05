import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';

const useSharingModalDismissed = ( initial: boolean ) => {
	const [ isDismissed, setSharingModalDismissed ] = useState( initial );

	function updateIsDismissed( value: boolean ) {
		apiFetch( {
			method: 'PUT',
			path: '/wpcom/v2/block-editor/sharing-modal-dismissed',
			data: { sharing_modal_dismissed: value },
		} ).finally( () => {
			setSharingModalDismissed( value );
		} );
	}
	return { isDismissed, updateIsDismissed };
};

export default useSharingModalDismissed;

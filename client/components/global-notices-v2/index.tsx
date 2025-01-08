import { useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import Notice from './notice';

import './style.scss';

const GlobalNoticesV2 = () => {
	const { notices } = useSelect( ( select ) => {
		return {
			notices: select( noticesStore ).getNotices(),
		};
	}, [] );

	if ( notices.length === 0 ) {
		return null;
	}

	return (
		<div className="global-notices-v2">
			{ notices.map( ( notice ) => (
				<Notice key={ notice.id } { ...notice } />
			) ) }
		</div>
	);
};

export default GlobalNoticesV2;

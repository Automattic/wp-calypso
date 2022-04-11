import { Icon, info } from '@wordpress/icons';
import type { TransferUnavailableNoticeProps } from './types';

import './style.scss';

const TransferUnavailableNotice = ( { message }: TransferUnavailableNoticeProps ): JSX.Element => {
	return (
		<div className="transfer-unavailable-notice__domain-notice">
			<Icon
				icon={ info }
				size={ 18 }
				className={
					'transfer-unavailable-notice__domain-notice-icon gridicon gridicon--error transfer-unavailable-notice__domain-notice-icon--rotated'
				}
				viewBox="2 2 20 20"
			/>
			<div className="transfer-unavailable-notice__domain-notice-message">{ message }</div>
		</div>
	);
};

export default TransferUnavailableNotice;

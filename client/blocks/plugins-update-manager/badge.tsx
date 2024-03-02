import { Icon, check, closeSmall } from '@wordpress/icons';

import './badge.scss';

interface Props {
	type: 'success' | 'failed';
}
export const Badge = ( props: Props ) => {
	const { type } = props;

	return (
		<span className={ `badge-component badge-component--${ type }` }>
			{ type === 'success' && <Icon icon={ check } size={ 20 } /> }
			{ type === 'failed' && <Icon icon={ closeSmall } size={ 20 } /> }
		</span>
	);
};

import { Card } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

const ActionPanel = ( { children, className = '' } ) => {
	return <Card className={ clsx( 'action-panel', className ) }>{ children }</Card>;
};

export default ActionPanel;

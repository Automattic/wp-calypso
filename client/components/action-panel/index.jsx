import { Card } from '@automattic/components';
import classnames from 'classnames';

import './style.scss';

const ActionPanel = ( { children, className } ) => {
	return <Card className={ classnames( 'action-panel', className ) }>{ children }</Card>;
};

export default ActionPanel;

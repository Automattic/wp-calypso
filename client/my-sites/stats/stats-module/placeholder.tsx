import { Spinner } from '@automattic/components';
import classNames from 'classnames';

import './placeholder.scss';

interface StatsModulePlaceholderProps {
	className?: string;
	isLoading: boolean;
}

const StatsModulePlaceholder: React.FC< StatsModulePlaceholderProps > = ( {
	className,
	isLoading,
} ) => {
	if ( ! isLoading ) {
		return null;
	}

	const classes = classNames( 'stats-module__placeholder', 'is-void', className );

	return (
		<div className={ classes }>
			<Spinner />
		</div>
	);
};

export default StatsModulePlaceholder;

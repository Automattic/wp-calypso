import { Spinner } from '@automattic/components';
import clsx from 'clsx';

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

	const classes = clsx( 'stats-module__placeholder', 'is-void', className );

	return (
		<div className={ classes }>
			<Spinner baseClassName="calypso-spinner" />
		</div>
	);
};

export default StatsModulePlaceholder;

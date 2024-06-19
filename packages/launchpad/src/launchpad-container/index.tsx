import clsx from 'clsx';
import React from 'react';

import './style.scss';

export interface ContainerProps {
	className?: string;
	headerClassName?: string;
	sidebarClassName?: string;
	mainContentClassName?: string;
	header?: React.ReactNode;
	sidebar: React.ReactNode;
	children: React.ReactNode;
}

const LaunchpadContainer: React.FunctionComponent< ContainerProps > = ( {
	className,
	headerClassName,
	sidebarClassName,
	mainContentClassName,
	header,
	sidebar,
	children,
} ) => {
	return (
		<main className={ clsx( 'launchpad-container', className ) }>
			{ header && (
				<div className={ clsx( 'launchpad-container__header', headerClassName ) }>{ header }</div>
			) }

			<div className="launchpad-container__content">
				<div className={ clsx( 'launchpad-container__sidebar', sidebarClassName ) }>
					{ sidebar }
				</div>
				<div className={ clsx( 'launchpad-container__main-content', mainContentClassName ) }>
					{ children }
				</div>
			</div>
		</main>
	);
};

export default LaunchpadContainer;

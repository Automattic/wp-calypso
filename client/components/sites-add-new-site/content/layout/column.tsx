import React from 'react';

type Props = {
	heading?: string;
	children: React.ReactNode;
};

export const Column = ( { heading, children }: Props ) => {
	return (
		<div className="sites-add-new-site__popover-column">
			{ heading && (
				<div className="sites-add-new-site__popover-column-heading">{ heading.toUpperCase() }</div>
			) }
			{ children }
		</div>
	);
};

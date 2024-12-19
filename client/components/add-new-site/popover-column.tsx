import React from 'react';

type Props = {
	heading?: string;
	children: React.ReactNode;
};

const AddNewSitePopoverColumn: React.FC< Props > = ( { heading, children } ) => {
	return (
		<div className="add-new-site__popover-column">
			{ heading && (
				<div className="add-new-site__popover-column-heading">{ heading.toUpperCase() }</div>
			) }
			{ children }
		</div>
	);
};

export default AddNewSitePopoverColumn;

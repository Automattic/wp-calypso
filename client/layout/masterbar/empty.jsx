import { Global, css } from '@emotion/react';

const EmptyMasterbar = () => (
	<>
		<Global
			styles={ css`
				:root {
					--masterbar-height: 0px !important;
				}
			` }
		/>
		<header id="header" className="masterbar" />
	</>
);

export default EmptyMasterbar;

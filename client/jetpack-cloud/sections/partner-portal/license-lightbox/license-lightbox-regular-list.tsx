import { FunctionComponent, ReactChild } from 'react';

type Props = {
	items: ReactChild[];
};

const LicenseLightboxRegularList: FunctionComponent< Props > = ( { items } ) => {
	return (
		<ul className="license-lightbox__regular-list">
			{ items.map( ( item, index ) => (
				<li key={ index }>{ item }</li>
			) ) }
		</ul>
	);
};

export default LicenseLightboxRegularList;

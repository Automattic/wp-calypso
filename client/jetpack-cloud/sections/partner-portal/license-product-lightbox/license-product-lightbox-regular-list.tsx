import { FunctionComponent, ReactChild } from 'react';

type Props = {
	items: ReactChild[];
};

const LicenseProductLightboxRegularList: FunctionComponent< Props > = ( { items } ) => {
	return (
		<ul className="license-product-lightbox__regular-list">
			{ items.map( ( item, index ) => (
				<li key={ index }>{ item }</li>
			) ) }
		</ul>
	);
};

export default LicenseProductLightboxRegularList;

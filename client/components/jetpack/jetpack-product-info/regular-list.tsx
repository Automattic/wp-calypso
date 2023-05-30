import { FunctionComponent, ReactChild } from 'react';

type Props = {
	items: ReactChild[];
};

const JetpackProductInfoRegularList: FunctionComponent< Props > = ( { items } ) => {
	return (
		<ul className="jetpack-product-info__regular-list">
			{ items.map( ( item, index ) => (
				<li key={ index }>{ item }</li>
			) ) }
		</ul>
	);
};

export default JetpackProductInfoRegularList;

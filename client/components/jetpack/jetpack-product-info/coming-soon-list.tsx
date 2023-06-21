import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';

type Props = {
	items: ReactNode[];
};

const JetpackProductInfoComingSoonList: FunctionComponent< Props > = ( { items } ) => {
	const translate = useTranslate();
	return (
		<ul className="jetpack-product-info__coming-soon-list">
			{ items.map( ( item, index ) => (
				<li key={ index }>
					<b>{ translate( 'Coming soon:' ) }</b> { item }
				</li>
			) ) }
		</ul>
	);
};

export default JetpackProductInfoComingSoonList;

import classNames from 'classnames';
import { MostPopularProps } from './types';

export const MostPopular: React.FC< MostPopularProps > = ( { className, heading, items } ) => {
	const wrapperClassName = classNames( 'jetpack-product-store__most-popular', className );

	return (
		<div className={ wrapperClassName }>
			<h3 className="jetpack-product-store__most-popular--heading">{ heading }</h3>
			<div className="jetpack-product-store__most-popular--items">{ items }</div>
		</div>
	);
};

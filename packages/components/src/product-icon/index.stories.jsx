import './index.stories.scss';
import { iconToProductSlugMap } from './config';
import ProductIcon from '.';

const supportedSlugs = Object.values( iconToProductSlugMap ).flat();

export default { title: 'Unaudited/ProductIcon' };

export const Default = () => {
	return (
		<>
			{ supportedSlugs.map( ( slug ) => (
				<div className="product-icon-stories__icon-tile">
					<ProductIcon slug={ slug } className="product-icon-stories__icon-image" />
					<pre className="product-icon-stories__icon-slug">{ slug }</pre>
				</div>
			) ) }
		</>
	);
};

import './index.stories.scss';
import { iconToProductSlugMap } from './config';
import ProductIcon from '.';

const supportedSlugs = Object.values( iconToProductSlugMap ).flat();

export default { title: 'ProductIcon' };

export const Default = () => {
	return (
		<>
			{ supportedSlugs.map( ( slug ) => (
				<div className="index.stories__icon-tile">
					<ProductIcon slug={ slug } className="index.stories__icon-image" />
					<pre className="index.stories__icon-slug">{ slug }</pre>
				</div>
			) ) }
		</>
	);
};

import { Button } from '@automattic/components';
import { FeatureTabInterface } from '../types';

import './style.scss';

export default function SitePreviewPaneTabs( {
	featureTabs,
}: {
	featureTabs: FeatureTabInterface[];
} ) {
	return (
		<>
			<div className="site-preview__tabs">
				{ featureTabs.map( ( featureTab: FeatureTabInterface ) => (
					<Button
						key={ featureTab.label }
						className={ 'site-preview__tab' + ( featureTab.selected ? ' is-selected' : '' ) }
						onClick={ () => featureTab.onTabClick?.() }
						borderless
					>
						{ featureTab.label }
					</Button>
				) ) }
			</div>
		</>
	);
}

import { Button } from '@automattic/components';
import classNames from 'classnames';
import { FeatureTabInterface } from '../types';

import './style.scss';

export default function SitePreviewPaneTabs( {
	featureTabs,
	className,
}: {
	featureTabs: FeatureTabInterface[];
	className?: string;
} ) {
	return (
		<>
			<div className={ classNames( 'site-preview__tabs', className ) }>
				{ featureTabs.map(
					( featureTab: FeatureTabInterface ) =>
						featureTab.visible && (
							<Button
								key={ featureTab.label }
								className={ 'site-preview__tab' + ( featureTab.selected ? ' is-selected' : '' ) }
								onClick={ () => featureTab.onTabClick?.() }
								borderless
							>
								{ featureTab.label }
							</Button>
						)
				) }
			</div>
		</>
	);
}

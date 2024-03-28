import classNames from 'classnames';
import type { ReactNode } from 'react';
import './features-item.scss';

interface Props {
	children?: ReactNode;
	isAvailable?: boolean;
}

export function FeaturesItem( { children, isAvailable = false }: Props ) {
	const rootClasses = classNames( 'features-grid__features-item', {
		'features-grid__features-item--available': isAvailable,
	} );

	return (
		<span className={ rootClasses }>
			<div className="features-grid__features-item-info-container">
				<div className="features-grid__features-item-info">{ children }</div>
			</div>
		</span>
	);
}

import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';

export const JetpackFeatures = ( {
	className,
	col1Features,
	col2Features,
}: {
	className?: string;
	col1Features: string[];
	col2Features: string[];
} ) => {
	return (
		<div className={ clsx( 'jetpack-connect__features_wrapper', className ) }>
			<ul className="jetpack-connect__features">
				{ col1Features.map( ( feature, index ) => (
					<li key={ index }>
						<Icon size={ 20 } icon={ check } />
						<span>{ feature }</span>
					</li>
				) ) }
			</ul>
			<ul className="jetpack-connect__features">
				{ col2Features.map( ( feature, index ) => (
					<li key={ index }>
						<Icon size={ 20 } icon={ check } />
						<span>{ feature }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

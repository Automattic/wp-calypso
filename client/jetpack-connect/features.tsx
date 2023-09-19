import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

export const JetpackFeatures = ( {
	className,
	col1Features,
	col2Features,
}: {
	className?: string;
	col1Features: string[];
	col2Features: string[];
} ) => {
	const translate = useTranslate();

	col1Features = col1Features || [
		translate( 'Speed up images and photos' ),
		translate( 'Prevent brute force attacks' ),
		translate( 'Secure user authentication' ),
		translate( 'Enhanced site stats and insights' ),
	];

	col2Features = col2Features || [
		translate( 'Daily or real-time backups' ),
		translate( 'Keep plugins auto-updated' ),
		translate( 'Immediate downtime alerts' ),
		translate( 'Bulk site management from one dashboard' ),
	];

	return (
		<div className={ classNames( 'jetpack-connect__features_wrapper', className ) }>
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

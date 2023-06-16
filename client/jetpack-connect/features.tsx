import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

export const JetpackFeatures = ( { className }: { className?: string } ) => {
	const translate = useTranslate();

	const col1Features = [
		translate( 'Speed up images and photos' ),
		translate( 'Prevent brute force attacks' ),
		translate( 'Secure user authentication' ),
		translate( 'Enhanced site stats and insights' ),
	];

	const col2Features = [
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

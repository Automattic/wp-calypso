/**
 * External dependencies
 */
import { store as coreDataStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { Icon, wordpress } from '@wordpress/icons';
import clsx from 'clsx';
import type { JSX } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

type SiteIconProps = {
	/**
	 * Custom class name for styling the component.
	 * This allows consumers to apply additional styles.
	 */
	className?: string;
};

/**
 * SiteIcon component.
 * Displays the site icon or a default icon if the site icon is not set.
 * @example
 * ```jsx
 * import SiteIcon from './components/site-icon';
 * function MyComponent() {
 *   return (
 *     <div>
 *       <h1>My Site</h1>
 *       <SiteIcon className="my-custom-class" />
 *     </div>
 *   );
 * }
 * ```
 * This component is strongly inspired by the SiteIcon component from the Edit Site package.
 * @see https://github.com/WordPress/gutenberg/blob/177743059a87db2ba5f11f83dc8964e543bf3a03/packages/edit-site/src/components/site-icon/index.js#L15
 * @param {SiteIconProps} props - SiteIcon props.
 * @returns {JSX.Element} SiteIcon component.
 */
function SiteIcon( { className }: SiteIconProps ): JSX.Element {
	const { isRequestingSite, siteIconUrl } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreDataStore );
		const siteData = getEntityRecord( 'root', '__unstableBase', undefined );

		const site_icon_url = getEntityRecord< {
			site_icon_url: string;
		} >( 'root', '__unstableBase' )?.site_icon_url;

		return {
			isRequestingSite: ! siteData,
			siteIconUrl: site_icon_url,
		};
	}, [] );

	if ( isRequestingSite && ! siteIconUrl ) {
		return <div className="site-admin-site-icon__image" />;
	}

	const icon = siteIconUrl ? (
		<img className="site-admin-site-icon__image" alt="" src={ siteIconUrl } />
	) : (
		<Icon className="site-admin-site-icon__icon" icon={ wordpress } size={ 48 } />
	);

	return <div className={ clsx( className, 'site-admin-site-icon' ) }>{ icon }</div>;
}

export { SiteIcon };

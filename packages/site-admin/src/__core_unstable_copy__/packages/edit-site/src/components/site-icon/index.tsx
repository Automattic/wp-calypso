/**
 * External dependencies
 */
import { Icon } from '@wordpress/components';
import { store as coreDataStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../../../debug';
import './style.scss'; // @Todo: different from core: not imported in this way

function SiteIcon( { className }: { className?: string } ): JSX.Element {
	unstableResourceWarning(
		'<SiteIcon />',
		'https://github.com/WordPress/gutenberg/blob/9f7d7dc52bb1ac42043f93a1e8bd243eddd5aa97/packages/edit-site/src/components/site-icon/index.js#L15'
	);

	const { isRequestingSite, siteIconUrl } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreDataStore );
		const siteData = getEntityRecord( 'root', '__unstableBase', undefined );

		// @todo: @unstable: TS fix -> site_icon_url should be string
		const site_icon_url = getEntityRecord< {
			site_icon_url: string;
		} >( 'root', '__unstableBase' )?.site_icon_url;

		return {
			isRequestingSite: ! siteData,
			siteIconUrl: site_icon_url,
		};
	}, [] );

	if ( isRequestingSite && ! siteIconUrl ) {
		return <div className="edit-site-site-icon__image" />;
	}

	const icon = siteIconUrl ? (
		<img
			className="edit-site-site-icon__image"
			alt={ __( 'Site Icon', 'woocommerce-analytics' ) }
			src={ siteIconUrl }
		/>
	) : (
		<Icon className="edit-site-site-icon__icon" icon={ wordpress } size={ 48 } />
	);

	return <div className={ clsx( className, 'edit-site-site-icon' ) }>{ icon }</div>;
}

export default SiteIcon;

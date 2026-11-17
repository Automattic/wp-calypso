import { Spinner } from '@automattic/components';
import { useAddOnPurchaseStatus } from '@automattic/data-stores/src/add-ons';
import { Button, Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { AddOnCardLayout, AddOnCardStatus } from 'calypso/sites/components/add-ons/add-ons-card';
import { useBundlePluginInstall } from '../hooks/use-bundle-plugin-install';
import type { PluginAddOnMeta } from '@automattic/data-stores';
import type { SiteId } from 'calypso/types';
import type { ReactNode } from 'react';

interface Props {
	addOnMeta: PluginAddOnMeta;
	siteId: SiteId;
	highlightFeatured: boolean;
}

const BundleAddOnCard = ( { addOnMeta, siteId, highlightFeatured }: Props ) => {
	const translate = useTranslate();
	const purchaseStatus = useAddOnPurchaseStatus( { selectedSiteId: siteId, addOnMeta } );
	const { state, install, error, hasTimedOut } = useBundlePluginInstall(
		siteId,
		addOnMeta.pluginSlug
	);

	const onInstall = () => {
		recordTracksEvent( 'calypso_add_ons_bundle_install_click', {
			plugin_slug: addOnMeta.pluginSlug,
		} );
		install();
	};

	let notice: ReactNode = null;
	if ( error ) {
		notice = error.message || translate( 'The installation failed. Please try again.' );
	} else if ( hasTimedOut ) {
		notice = translate(
			'The installation is taking longer than expected. Check again in a few minutes.'
		);
	}

	return (
		<AddOnCardLayout
			addOnMeta={ addOnMeta }
			highlightFeatured={ highlightFeatured }
			billing={ purchaseStatus.text }
		>
			<div>
				{ notice && state === 'not-installed' && (
					<Notice status="error" isDismissible={ false }>
						{ notice }
					</Notice>
				) }
				{ ( state === 'loading' || state === 'installing' ) && (
					<Spinner size={ 24 } className="spinner-button__spinner" />
				) }
				{ state === 'installed' && <AddOnCardStatus>{ translate( 'Installed' ) }</AddOnCardStatus> }
				{ state === 'not-installed' && (
					<Button variant="primary" onClick={ onInstall }>
						{ translate( 'Install' ) }
					</Button>
				) }
			</div>
		</AddOnCardLayout>
	);
};

export default BundleAddOnCard;

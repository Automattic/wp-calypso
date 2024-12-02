import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useMemo, useRef, useState } from 'react';
import ItemPreviewPane from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import * as paths from 'calypso/my-sites/domains/paths';
import type {
	ItemData,
	FeaturePreviewInterface,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';

interface Props {
	selectedDomainPreview: React.ReactNode;
	selectedDomain: string;
	selectedFeature: string;
}

// This is the tabbed preview pane that is used for the domain management pages.
// Anything passed as selectedDomainPreview will be rendered in the preview pane.
// The selectedFeature prop is used to determine which tab is selected by default.
const DomainOverviewPane = ( {
	selectedDomainPreview,
	selectedDomain,
	selectedFeature,
}: Props ) => {
	const itemData: ItemData = {
		title: selectedDomain,
		subtitle: selectedDomain,
		blogId: 12435645646456468,
		isDotcomSite: true,
		adminUrl: `testdomain.com/wp-admin`,
		withIcon: false,
		hideEnvDataInHeader: true,
	};

	type BtnProps = {
		focusRef: React.RefObject< HTMLButtonElement >;
		itemData: ItemData;
		closeSitePreviewPane?: () => void;
	};

	const PreviewPaneHeaderButtons = ( { focusRef, closeSitePreviewPane }: BtnProps ) => {
		const adminButtonRef = useRef< HTMLButtonElement | null >( null );

		return (
			<>
				<Button onClick={ closeSitePreviewPane } className="item-preview__close-preview-button">
					{ __( 'Close' ) }
				</Button>
				<Button
					variant="primary"
					className="item-preview__admin-button"
					ref={ useMergeRefs( [ adminButtonRef, focusRef ] ) }
				>
					{ __( 'Manage Site' ) }
				</Button>
			</>
		);
	};

	const [ selectedSiteFeature, setSelectedSiteFeature ] = useState( selectedFeature );

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ 'domain-overview' ],
			},
			{
				label: __( 'Email' ),
				enabled: true,
				featureIds: [ 'email' ],
			},
		];

		return siteFeatures.map( ( { label, enabled, featureIds } ) => {
			const selected = enabled && featureIds.includes( selectedSiteFeature );
			const defaultFeatureId = featureIds[ 0 ];
			return {
				id: defaultFeatureId,
				tab: {
					label,
					visible: enabled,
					selected,
					onTabClick: () => {
						if ( enabled && ! selected ) {
							setSelectedSiteFeature( defaultFeatureId );
						}
					},
				},
				enabled,
				preview: enabled ? selectedDomainPreview : null,
			};
		} );
	}, [ __, selectedDomain, selectedSiteFeature ] );

	return (
		<ItemPreviewPane
			itemData={ itemData }
			closeItemPreviewPane={ () => {
				page.show( paths.domainManagementRoot() );
			} }
			features={ features }
			enforceTabsView
			itemPreviewPaneHeaderExtraProps={ {
				headerButtons: PreviewPaneHeaderButtons,
			} }
		/>
	);
};

export default DomainOverviewPane;

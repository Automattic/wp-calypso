import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import PreferencesLoginSiteDropdown from './site-dropdown';

interface PrimarySiteFormData {
	primarySiteId?: number;
}

export default function PreferencesPrimarySite( {
	primarySiteId: controlledPrimarySiteId,
	onChange,
	footer,
}: {
	primarySiteId?: number;
	onChange: ( primarySiteId: number ) => void;
	footer?: React.ReactNode;
} ) {
	const { user } = useAuth();
	const { queries } = useAppContext();

	const { data: savedPrimarySiteId } = useSuspenseQuery( {
		...userSettingsQuery(),
		select: ( data ) => data.primary_site_ID,
	} );

	const { data: sites, isLoading: isSiteListLoading } = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	const primarySiteId = controlledPrimarySiteId ?? savedPrimarySiteId;

	// Define form fields
	const fields: Field< PrimarySiteFormData >[] = [
		{
			id: 'primarySiteId',
			label: __( 'Site' ),
			isVisible: () => user.visible_site_count > 0,
			Edit: ( { field, onChange: onFieldChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				const value = getValue( { item: data } )?.toString( 10 ) ?? '';
				return (
					<PreferencesLoginSiteDropdown
						sites={ sites ?? [] }
						isLoading={ isSiteListLoading }
						value={ value }
						onChange={ ( newValue ) => {
							if ( newValue ) {
								onFieldChange( { [ id ]: parseInt( newValue, 10 ) } );
							}
						} }
						label={ hideLabelFromVision ? '' : field.label }
						hideLabelFromVision={ hideLabelFromVision }
					/>
				);
			},
		},
	];

	// Define form layout
	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'primarySiteId' ],
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Primary site' ) }
						description={ __( 'Your go-to site, always within reach.' ) }
					/>

					<DataForm< PrimarySiteFormData >
						data={ { primarySiteId } }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< PrimarySiteFormData > ) => {
							if ( edits.primarySiteId !== undefined ) {
								onChange( edits.primarySiteId );
							}
						} }
					/>
					{ footer }
				</VStack>
			</CardBody>
		</Card>
	);
}

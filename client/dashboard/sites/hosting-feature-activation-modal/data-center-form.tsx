import { getDataCenterOptions } from '@automattic/api-core';
import { Button, Card, CardBody, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import InlineSupportLink from '../../components/inline-support-link';
import { Text } from '../../components/text';

const AllDataCenterOptions = [
	{
		value: '',
		label: __( 'Optimal data center' ),
	},
	...Object.entries( getDataCenterOptions() ).map( ( [ key, value ] ) => ( {
		value: key,
		label: value as string,
	} ) ),
];

interface DataCenterFormProps {
	value: string;
	onChange: ( value: string ) => void;
}

export function DataCenterForm( { value, onChange }: DataCenterFormProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ shouldShowForm, setShouldShowForm ] = useState( false );

	if ( ! shouldShowForm ) {
		return (
			<Text>
				{ createInterpolateElement(
					__(
						'Your site will be placed in the optimal data center, but you can <button>change it</button>.'
					),
					{
						button: (
							<Button
								variant="link"
								onClick={ () => {
									setShouldShowForm( true );
									recordTracksEvent(
										'calypso_dashboard_hosting_feature_activation_modal_data_center_form_show'
									);
								} }
							/>
						),
					}
				) }
			</Text>
		);
	}

	return (
		<Card size="small">
			<CardBody>
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Pick your primary data center' ) }
					help={ createInterpolateElement(
						__(
							'For redundancy, your site will be replicated in real-time to another region. <link>Learn more</link>'
						),
						{
							link: (
								<InlineSupportLink
									supportPostId={ 227309 }
									// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
									supportLink="https://wordpress.com/support/choose-your-sites-primary-data-center/"
								/>
							),
						}
					) }
					options={ AllDataCenterOptions.map( ( option ) => ( {
						label: option.label,
						value: option.value,
					} ) ) }
					onChange={ ( value ) => {
						onChange( value );
						recordTracksEvent(
							'calypso_dashboard_hosting_feature_activation_modal_data_center_form_change',
							{ value }
						);
					} }
					value={ value }
				/>
			</CardBody>
		</Card>
	);
}

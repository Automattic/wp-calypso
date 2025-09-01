import { Button, Card, CardBody, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import { Text } from '../../components/text';

const DataCenterOptions = [
	{
		value: '',
		label: __( 'Optimal data center' ),
	},
	{
		value: 'bur',
		label: __( 'US West' ),
	},
	{
		value: 'dfw',
		label: __( 'US Central' ),
	},
	{
		value: 'dca',
		label: __( 'US East' ),
	},
	{
		value: 'ams',
		label: __( 'EU West' ),
	},
];

interface DataCenterFormProps {
	value: string;
	onChange: ( value: string ) => void;
}

export function DataCenterForm( { value, onChange }: DataCenterFormProps ) {
	const [ shouldShowForm, setShouldShowForm ] = useState( false );

	if ( ! shouldShowForm ) {
		return (
			<Text>
				{ createInterpolateElement(
					__(
						'Your site will be placed in the optimal data center, but you can <button>change it</button>.'
					),
					{
						button: <Button variant="link" onClick={ () => setShouldShowForm( true ) } />,
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
					options={ DataCenterOptions.map( ( option ) => ( {
						label: option.label,
						value: option.value,
					} ) ) }
					onChange={ ( value ) => onChange( value ) }
					value={ value }
				/>
			</CardBody>
		</Card>
	);
}

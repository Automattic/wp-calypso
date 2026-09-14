import { getDataCenterOptions } from '@automattic/api-core';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import {
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	SelectControl,
} from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';

interface ExternalProps {
	value: string;
	onChange: ( newValue: string ) => void;
	onClickHidePicker?: () => void;
	onClickShowPicker?: () => void;
	compact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

const AllDataCenterOptions = [
	{
		value: '',
		get label(): string {
			return translate( 'Optimal data center' );
		},
	},
	...Object.entries( getDataCenterOptions() ).map( ( [ key, value ] ) => ( {
		value: key,
		get label(): string {
			return value as string;
		},
	} ) ),
];

const DataCenterPicker = ( {
	onChange,
	onClickShowPicker = () => null,
	translate,
	value,
}: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );
	const hasEnTranslation = useHasEnTranslation();

	const supportLink = (
		<InlineSupportLink
			showIcon={ false }
			supportPostId={ 227309 }
			supportLink={ localizeUrl(
				'https://wordpress.com/support/choose-your-sites-primary-data-center/'
			) }
		/>
	);

	if ( ! isFormShowing ) {
		return (
			<Text>
				{ translate(
					'We’ll pick the best data center for your site, but you can {{customizeLink}}choose a different location{{/customizeLink}}.',
					{
						components: {
							customizeLink: (
								<Button
									variant="link"
									onClick={ () => {
										onClickShowPicker();
										setIsFormShowing( true );
									} }
								/>
							),
						},
					}
				) }
			</Text>
		);
	}

	return (
		<Card size="small">
			<CardBody>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ translate( 'Pick your primary data center' ) }
					help={
						hasEnTranslation(
							'For redundancy, your site will be replicated in real-time to another region. {{supportLink}}Learn more{{/supportLink}}.'
						)
							? translate(
									'For redundancy, your site will be replicated in real-time to another region. {{supportLink}}Learn more{{/supportLink}}.',
									{ components: { supportLink } }
							  )
							: translate(
									'For redundancy, your site will replicate in real-time to a second data center in a different region. {{supportLink}}Learn more{{/supportLink}}.',
									{ components: { supportLink } }
							  )
					}
					options={ AllDataCenterOptions.map( ( option ) => ( {
						label: option.label,
						value: option.value,
					} ) ) }
					onChange={ ( value ) => onChange( value ) }
					value={ value }
				/>
			</CardBody>
		</Card>
	);
};

export default localize( DataCenterPicker );

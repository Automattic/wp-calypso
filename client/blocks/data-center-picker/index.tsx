import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { SelectControl } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';
import ExternalLink from 'calypso/components/external-link';

interface ExternalProps {
	value: string;
	onChange: ( newValue: string ) => void;
	onClickHidePicker?: () => void;
	onClickShowPicker?: () => void;
	compact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

const DataCenterOptions = [
	{
		value: '',
		get label(): string {
			return translate( 'Optimal data center' );
		},
	},
	{
		value: 'bur',
		get label(): string {
			return translate( 'US West' );
		},
	},
	{
		value: 'dfw',
		get label(): string {
			return translate( 'US Central' );
		},
	},
	{
		value: 'dca',
		get label(): string {
			return translate( 'US East' );
		},
	},
	{
		value: 'ams',
		get label(): string {
			return translate( 'EU West' );
		},
	},
];

const Form = styled.div( {
	maxWidth: '564px',
} );

const CustomizeLink = styled.a`
	color: var( --color-link );
	text-decoration: underline;
	cursor: pointer;
`;

const DataCenterPicker = ( {
	onChange,
	onClickShowPicker = () => null,
	translate,
	value,
}: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );

	return (
		<div>
			{ ! isFormShowing && (
				<div>
					<span>
						{ translate(
							'Your site will be placed in the optimal data center, but you can {{customizeLink}}customize it{{/customizeLink}}.',
							{
								components: {
									customizeLink: (
										<CustomizeLink
											onClick={ () => {
												onClickShowPicker();
												setIsFormShowing( ! isFormShowing );
											} }
										/>
									),
								},
							}
						) }
					</span>
				</div>
			) }

			{ isFormShowing && (
				<Form>
					<SelectControl
						label={ translate( 'Pick your primary data center' ) }
						help={ translate(
							'For redundancy, your site will replicate in real-time to a second data center in a different region. {{supportLink}}Learn more{{/supportLink}}.',
							{
								components: {
									supportLink: (
										<ExternalLink
											icon
											target="_blank"
											href={ localizeUrl(
												'https://wordpress.com/support/choose-your-sites-primary-data-center/'
											) }
										/>
									),
								},
							}
						) }
						options={ DataCenterOptions.map( ( option ) => ( {
							label: option.label,
							value: option.value,
						} ) ) }
						onChange={ ( value ) => onChange( value ) }
						value={ value }
					/>
				</Form>
			) }
		</div>
	);
};

export default localize( DataCenterPicker );

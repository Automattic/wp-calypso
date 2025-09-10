import { getDataCenterOptions } from '@automattic/api-core';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { SelectControl } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';

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

const Form = styled.div( {
	maxWidth: '564px',
	border: '1px solid var( --color-border-subtle )',
	borderRadius: '4px',
	padding: '24px',
} );

const FormHidden = styled.div( {
	fontSize: '0.75rem',
} );

const CustomizeLink = styled.a`
	text-decoration: underline;
	cursor: pointer;
`;

const SupportLink = styled.a`
	text-decoration: underline;
`;

const StyledLabel = styled.div`
	text-transform: none;
	font-size: 0.875rem;
	color: var( --studio-gray-50 );
	text-wrap: wrap;
`;

const DataCenterPicker = ( {
	onChange,
	onClickShowPicker = () => null,
	translate,
	value,
}: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );
	const hasEnTranslation = useHasEnTranslation();

	const supportLinkComponent = (
		<SupportLink
			target="_blank"
			href={ localizeUrl( 'https://wordpress.com/support/choose-your-sites-primary-data-center/' ) }
		/>
	);

	return (
		<div>
			{ ! isFormShowing && (
				<FormHidden>
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
				</FormHidden>
			) }

			{ isFormShowing && (
				<Form>
					<SelectControl
						__nextHasNoMarginBottom
						label={ <StyledLabel>{ translate( 'Pick your primary data center' ) }</StyledLabel> }
						help={
							hasEnTranslation(
								'For redundancy, your site will be replicated in real-time to another region. {{supportLink}}Learn more{{/supportLink}}.'
							)
								? translate(
										'For redundancy, your site will be replicated in real-time to another region. {{supportLink}}Learn more{{/supportLink}}.',
										{
											components: {
												supportLink: supportLinkComponent,
											},
										}
								  )
								: translate(
										'For redundancy, your site will replicate in real-time to a second data center in a different region. {{supportLink}}Learn more{{/supportLink}}.',
										{
											components: {
												supportLink: supportLinkComponent,
											},
										}
								  )
						}
						options={ AllDataCenterOptions.map( ( option ) => ( {
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

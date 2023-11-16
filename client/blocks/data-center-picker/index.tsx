import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';
import amsImg from 'calypso/assets/images/data-center-picker/ams-240x180.png';
import burImg from 'calypso/assets/images/data-center-picker/bur-240x180.png';
import dcaImg from 'calypso/assets/images/data-center-picker/dca-240x180.png';
import dfwImg from 'calypso/assets/images/data-center-picker/dfw-240x180.png';
import worldImg from 'calypso/assets/images/data-center-picker/world-1082x180.png';
import ExternalLink from 'calypso/components/external-link';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormSelect from 'calypso/components/forms/form-select';

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
		value: 'bur',
		name: 'geo_affinity',
		get label(): string {
			return translate( 'US West' );
		},
		thumbnail: {
			imageUrl: burImg,
		},
	},
	{
		value: 'dfw',
		name: 'geo_affinity',
		get label(): string {
			return translate( 'US Central' );
		},
		thumbnail: {
			imageUrl: dfwImg,
		},
	},
	{
		value: 'dca',
		name: 'geo_affinity',
		get label(): string {
			return translate( 'US East' );
		},
		thumbnail: {
			imageUrl: dcaImg,
		},
	},
	{
		value: 'ams',
		name: 'geo_affinity',
		get label(): string {
			return translate( 'EU West' );
		},
		thumbnail: {
			imageUrl: amsImg,
		},
	},
];

const Form = styled.div( {
	maxWidth: '564px',
} );

const FormHeadingContainer = styled.div( {
	display: 'flex',
	alignItems: 'center',
	marginBottom: '8px',
} );

const FormHeading = styled.h3( {
	fontWeight: 600,
	marginRight: '8px',
} );

const FormDescription = styled.p( {
	marginBottom: '12px',
} );

const AutomaticFormLabel = styled.label( {
	display: 'block',
	marginBottom: '12px',
	width: '100%',
	maxWidth: '541px',
	cursor: 'pointer',
} );

const CompactLabel = styled.label( {
	cursor: 'pointer',
	display: 'flex',
	padding: '24px 16px',
	border: '2px solid #DCDCDE',
	borderRadius: '4px',

	'&:hover': {
		background: '#F9FBFD',
	},

	'&:has(input[type=radio]:checked)': {
		background: '#F9FBFD',
		borderColor: '#0675C4',
	},
} );

const PickerOptions = styled.div( { display: 'flex', flexDirection: 'column', gap: '16px' } );

const PickerOption = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'flex-start',
	alignItems: 'flex-start',
	gap: '8px',
} );

const PickerOptionLabel = styled.span( { lineHeight: '20px', fontWeight: 600, color: '#101517' } );

const PickerRadio = styled.input( {
	margin: '2px 16px 0 0',
} );

const CompactPickerSelect = styled( FormSelect )( {
	width: 'fit-content',
	borderRadius: '4px',
} );

const FormLabelThumbnail = styled.div( {
	display: 'flex',
	width: '100%',
	height: '90px',
	margin: '2px 0 8px',
	backgroundColor: 'var(--color-surface)',
	backgroundPosition: '50% 0',
	backgroundSize: 'cover',
	borderRadius: '2px',
	boxShadow: '0 0 0 1px rgba(var(--color-neutral-10-rgb), 0.5), 0 1px 2px var(--color-neutral-0)',
	transition: 'all 100ms ease-in-out',
	overflow: 'hidden',
	'&:hover': {
		boxShadow: '0 0 0 1px var(--color-neutral-light), 0 2px 4px var(--color-neutral-10)',
	},
} );

const FormLabelThumbnailImg = styled.img( {
	objectFit: 'cover',
} );

const RECOMMENDED_DATA_CENTER = '';

const DataCenterPicker = ( {
	onChange,
	onClickHidePicker = () => null,
	onClickShowPicker = () => null,
	translate,
	value,
	compact = false,
}: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );

	const onCancel = () => {
		onChange( RECOMMENDED_DATA_CENTER );
		onClickHidePicker();
		setIsFormShowing( false );
	};

	const isRecommendedDataCenterPicked = value === RECOMMENDED_DATA_CENTER;

	if ( compact ) {
		return (
			<div className="data-center-picker">
				<FormHeadingContainer>
					<FormHeading>{ translate( 'Pick your primary data center' ) }</FormHeading>
				</FormHeadingContainer>
				<FormDescription className="data-center-picker__description">
					{ translate(
						'Your site will replicate in real-time to a second data center in a different region. {{supportLink}}Learn more{{/supportLink}}.',
						{
							components: {
								supportLink: (
									<ExternalLink
										target="_blank"
										href={ localizeUrl(
											'https://wordpress.com/support/choose-your-sites-primary-data-center/'
										) }
									/>
								),
							},
						}
					) }
				</FormDescription>
				<PickerOptions className="data-center-picker__options" role="radiogroup">
					<CompactLabel>
						<PickerRadio
							className="form-radio"
							type="radio"
							name="geo_affinity"
							onChange={ () => onChange( RECOMMENDED_DATA_CENTER ) }
							checked={ isRecommendedDataCenterPicked }
						/>
						<PickerOption>
							<PickerOptionLabel>{ translate( 'Optimal data center' ) }</PickerOptionLabel>
							<span>
								{ translate( 'Automatically place my site in the optimal data center.' ) }
							</span>
						</PickerOption>
					</CompactLabel>
					<CompactLabel>
						<PickerRadio
							className="form-radio"
							type="radio"
							name="geo_affinity"
							onChange={ () => onChange( DataCenterOptions[ 0 ].value ) }
							checked={ ! isRecommendedDataCenterPicked }
						/>
						<PickerOption>
							<PickerOptionLabel>{ translate( 'Custom data center' ) }</PickerOptionLabel>
							<span>{ translate( 'Choose the data center that best suits your needs.' ) }</span>
							{ ! isRecommendedDataCenterPicked && (
								<CompactPickerSelect
									onChange={ ( event ) => onChange( event.currentTarget.value ) }
									value={ value }
								>
									{ DataCenterOptions.map( ( option ) => (
										<option key={ option.value } value={ option.value }>
											{ option.label }
										</option>
									) ) }
								</CompactPickerSelect>
							) }
						</PickerOption>
					</CompactLabel>
				</PickerOptions>
			</div>
		);
	}

	return (
		<div>
			{ ! isFormShowing && (
				<div>
					<span>
						{ translate( 'Your site will be automatically placed in the optimal data center.' ) }
					</span>
					&nbsp;
					<Button
						variant="tertiary"
						onClick={ () => {
							onClickShowPicker();
							setIsFormShowing( ! isFormShowing );
						} }
					>
						{ translate( 'Choose a data center instead' ) }
					</Button>
				</div>
			) }

			{ isFormShowing && (
				<Form>
					<FormHeadingContainer>
						<FormHeading>{ translate( 'Pick your primary data center' ) }</FormHeading>
						<Button variant="tertiary" onClick={ onCancel }>
							{ translate( 'Cancel' ) }
						</Button>
					</FormHeadingContainer>
					<FormDescription>
						{ translate(
							'Choose a primary data center for your site. For redundancy, your site will replicate in real-time to a second data center in a different region. {{supportLink}}Learn more{{/supportLink}}.',
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
					</FormDescription>
					<div role="radiogroup">
						<AutomaticFormLabel>
							<FormLabelThumbnail>
								<FormLabelThumbnailImg
									src={ worldImg }
									alt={ translate( 'Illustration of the world' ) }
								/>
							</FormLabelThumbnail>
							<input
								className="form-radio"
								type="radio"
								name="geo_affinity"
								value=""
								checked={ isRecommendedDataCenterPicked }
								onChange={ () => onChange( RECOMMENDED_DATA_CENTER ) }
							/>
							<span>
								{ translate( 'Automatically place my site in the optimal data center.' ) }
							</span>
						</AutomaticFormLabel>
						<FormRadiosBar
							isThumbnail
							checked={ value }
							onChange={ ( event ) => onChange( event.currentTarget.value ) }
							items={ DataCenterOptions }
							disabled={ false }
						/>
					</div>
				</Form>
			) }
		</div>
	);
};

export default localize( DataCenterPicker );

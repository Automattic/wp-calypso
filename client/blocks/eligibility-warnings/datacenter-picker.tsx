import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';
import amsImg from 'calypso/assets/images/datacenter-picker/ams-240x180.png';
import burImg from 'calypso/assets/images/datacenter-picker/bur-240x180.png';
import dcaImg from 'calypso/assets/images/datacenter-picker/dca-240x180.png';
import dfwImg from 'calypso/assets/images/datacenter-picker/dfw-240x180.png';
import worldImg from 'calypso/assets/images/datacenter-picker/world-1082x180.png';
import ExternalLink from 'calypso/components/external-link';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';

interface ExternalProps {
	value: string;
	onChange: ( newValue: string ) => void;
	onClickHidePicker?: () => void;
	onClickShowPicker?: () => void;
}

type Props = ExternalProps & LocalizeProps;

const DatacenterOptions = [
	{
		value: 'ams',
		name: 'geo_affinity',
		label: translate( 'Amsterdam' ),
		thumbnail: {
			imageUrl: amsImg,
		},
	},
	{
		value: 'bur',
		name: 'geo_affinity',
		label: translate( 'California' ),
		thumbnail: {
			imageUrl: burImg,
		},
	},
	{
		value: 'dfw',
		name: 'geo_affinity',
		label: translate( 'Texas' ),
		thumbnail: {
			imageUrl: dfwImg,
		},
	},
	{
		value: 'dca',
		name: 'geo_affinity',
		label: translate( 'Washington, D.C.' ),
		thumbnail: {
			imageUrl: dcaImg,
		},
	},
];

const Form = styled.form( {
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

const FormLabelThumbnail = styled.div( {
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

const DatacenterPicker = ( {
	onChange,
	onClickHidePicker = () => null,
	onClickShowPicker = () => null,
	translate,
	value,
}: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );

	const onCancel = () => {
		onChange( '' );
		onClickHidePicker();
		setIsFormShowing( false );
	};

	return (
		<div>
			{ ! isFormShowing && (
				<div>
					<span>
						{ translate( 'Your site will be automatically placed in the best datacenter.' ) }
					</span>
					&nbsp;
					<Button
						isTertiary={ true }
						onClick={ () => {
							onClickShowPicker();
							setIsFormShowing( ! isFormShowing );
						} }
					>
						{ translate( 'Choose a datacenter instead' ) }
					</Button>
				</div>
			) }

			{ isFormShowing && (
				<Form>
					<FormHeadingContainer>
						<FormHeading>{ translate( 'Primary datacenter' ) }</FormHeading>
						<Button isTertiary={ true } onClick={ onCancel }>
							{ translate( 'Cancel' ) }
						</Button>
					</FormHeadingContainer>
					<FormDescription>
						{ translate(
							'Choose a primary datacenter for your site. For redundancy, your site will replicate in real-time to a second datacenter in different region. {{supportLink}}Learn more{{/supportLink}}.',
							{
								components: {
									supportLink: <ExternalLink icon target="_blank" href={ localizeUrl( '#' ) } />,
								},
							}
						) }
					</FormDescription>
					<div role="radiogroup">
						<AutomaticFormLabel>
							<FormLabelThumbnail>
								<img src={ worldImg } alt={ translate( 'Illustration of the world' ) } />
							</FormLabelThumbnail>
							<input
								className="form-radio"
								type="radio"
								name="geo_affinity"
								value=""
								checked={ value === '' }
								onChange={ () => onChange( '' ) }
							/>
							<span>{ translate( 'Automatically place my site in the best datacenter' ) }</span>
						</AutomaticFormLabel>
						<FormRadiosBar
							isThumbnail
							checked={ value }
							onChange={ ( event ) => onChange( event.currentTarget.value ) }
							items={ DatacenterOptions }
							disabled={ false }
						/>
					</div>
				</Form>
			) }
		</div>
	);
};

export default localize( DatacenterPicker );

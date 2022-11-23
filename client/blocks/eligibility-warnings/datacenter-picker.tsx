import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';

interface ExternalProps {
	value: string;
	onChange: () => void;
}

type Props = ExternalProps & LocalizeProps;

const DatacenterOptions = [
	{
		value: 'ams',
		label: translate( 'Amsterdam' ),
		thumbnail: {
			imageUrl: '',
		},
	},
	{
		value: 'bur',
		label: translate( 'California' ),
		thumbnail: {
			imageUrl: '',
		},
	},
	{
		value: 'dfw',
		label: translate( 'Texas' ),
		thumbnail: {
			imageUrl: '',
		},
	},
	{
		value: 'dca',
		label: translate( 'Washington, D.C.' ),
		thumbnail: {
			imageUrl: '',
		},
	},
];

const FormHeading = styled.h3( {
	fontWeight: 600,
	marginBottom: '8px',
} );

const FormDescription = styled.p( {
	marginBottom: '12px',
} );

const AutomaticFormLabel = styled.label( {
	display: 'block',
	marginBottom: '10px',
	width: '543px',
	maxWidth: '100%',
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
} );

const DatacenterPicker = ( { onChange, translate, value }: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );

	return (
		<div>
			{ ! isFormShowing && (
				<div>
					<span>
						{ translate( 'Your site will be automatically placed in the best datacenter.' ) }
					</span>
					&nbsp;
					<Button isTertiary={ true } onClick={ () => setIsFormShowing( ! isFormShowing ) }>
						{ translate( 'Choose a datacenter instead' ) }
					</Button>
				</div>
			) }

			{ isFormShowing && (
				<form>
					<FormHeading>{ translate( 'Primary datacenter' ) }</FormHeading>
					<FormDescription>
						{ translate(
							'Choose a primary datacenter for your site. Your site will also replicate to a second datacenter in real-time for redundancy.'
						) }
					</FormDescription>
					<AutomaticFormLabel>
						<FormLabelThumbnail />
						<input
							className="form-radio"
							name="geo_affinity"
							type="radio"
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
				</form>
			) }
		</div>
	);
};

export default localize( DatacenterPicker );

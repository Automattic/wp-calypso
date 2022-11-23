import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { useState } from 'react';
import ExternalLink from 'calypso/components/external-link';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';

interface ExternalProps {
	value: string;
	onChange: ( newValue: string ) => void;
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
	marginBottom: '10px',
	width: '100%',
	maxWidth: '541px',
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

const DatacenterPicker = ( { onChange, translate, value }: Props ) => {
	const [ isFormShowing, setIsFormShowing ] = useState( false );

	const onCancel = () => {
		onChange( '' );
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
					<Button isTertiary={ true } onClick={ () => setIsFormShowing( ! isFormShowing ) }>
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
							<FormLabelThumbnail />
							<input
								className="form-radio"
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
					</div>
				</Form>
			) }
		</div>
	);
};

export default localize( DatacenterPicker );

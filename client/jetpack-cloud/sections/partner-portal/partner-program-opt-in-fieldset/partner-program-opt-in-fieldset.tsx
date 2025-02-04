import { Button, FormLabel, Popover } from '@automattic/components';
import { Icon, info, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useRef, useState } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';

import './style.scss';

interface Props {
	setPartnerProgramOptIn: ( partnerProgramOptIn: boolean ) => void;
	isChecked: boolean;
}

export default function PartnerProgramOptInFieldset( {
	setPartnerProgramOptIn,
	isChecked,
}: Props ) {
	const translate = useTranslate();

	const [ showPartnerProgramDetails, setShowPartnerProgramDetails ] = useState( false );

	const detailsRef = useRef< HTMLButtonElement | null >( null );

	return (
		<FormFieldset className="partner-program-opt-in-field">
			<FormLabel>
				{ translate( 'Jetpack Agency & Pro Partner program' ) }
				<Button
					ref={ detailsRef }
					className="partner-program-opt-in-field__details-icon-button"
					borderless
					onClick={ () => setShowPartnerProgramDetails( true ) }
				>
					<Icon size={ 16 } icon={ info } />
				</Button>
			</FormLabel>
			<FormInputCheckbox
				id="partnerProgramOptIn"
				name="partnerProgramOptIn"
				checked={ isChecked }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
					setPartnerProgramOptIn( event.target.checked )
				}
			/>
			<span>{ translate( 'Sign up for the Jetpack Agency & Pro Partner program' ) }</span>
			<Popover
				className="partner-program-opt-in-field__details-popover"
				context={ detailsRef.current }
				isVisible={ showPartnerProgramDetails }
				position="bottom"
				showDelay={ 300 }
			>
				<h2>{ translate( 'Agency & Pro program benefits' ) }</h2>

				<p>
					{ translate(
						"Our program is more than tooling. We'll provide resources to help you sell Jetpack, onboarding & training, marketing opportunities, access to our vibrant community, and more!"
					) }
				</p>

				<p>
					<a href="https://jetpack.com/agencies-pros/" target="_blank" rel="noreferrer">
						{ translate( 'More about the program' ) }
						<Icon icon={ external } size={ 16 } />
					</a>
				</p>

				<Button className="button" onClick={ () => setShowPartnerProgramDetails( false ) }>
					{ translate( 'Got it' ) }
				</Button>
			</Popover>
		</FormFieldset>
	);
}

import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Input } from 'calypso/my-sites/domains/components/form';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { stepsHeadingOwnershipVerification } from './constants';
import { DomainStepAuthCodeProps } from './types';

import './style.scss';

const DomainStepAuthCode = ( {
	authCodeDescription,
	className,
	domain,
	validateHandler,
	pageSlug,
	onBeforeValidate,
	progressStepList,
	selectedSite,
	buttonMessage,
	customHeading,
	...props
}: DomainStepAuthCodeProps ) => {
	const { __ } = useI18n();
	const [ authCode, setAuthCode ] = useState( '' );
	const [ connectInProgress, setConnectInProgress ] = useState( false );
	const [ authCodeError, setAuthCodeError ] = useState< ( string | undefined ) | null >( null );

	const heading = customHeading ?? stepsHeadingOwnershipVerification;

	const getVerificationData = () => {
		return {
			ownership_verification_data: {
				verification_type: 'auth_code' as const,
				verification_data: authCode,
			},
		};
	};

	const validateAuthCode = () => {
		setConnectInProgress( true );

		validateHandler(
			{
				...props,
				domain,
				selectedSite,
				verificationData: getVerificationData(),
			},
			( error ) => {
				if ( ! error ) return;
				if ( error.message ) {
					setAuthCodeError( error.message );
				}
				setConnectInProgress( false );
			}
		);
	};

	const onAuthCodeChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		setAuthCode( event?.target?.value );
		setAuthCodeError( null );
	};

	const validate = () => {
		if ( 0 === authCode.length ) {
			setAuthCodeError( __( 'Please enter an authorization code.' ) );
			return;
		}

		setAuthCodeError( null );
		onBeforeValidate();
		validateAuthCode();
	};

	const stepContent = (
		<div className={ className + '__login' }>
			{ authCodeDescription }
			<div className={ className + '__authorization-code' }>
				<Input
					placeholder={ __( 'Enter authorization code' ) }
					onChange={ onAuthCodeChange }
					value={ authCode }
					isError={ !! authCodeError }
					errorMessage={ authCodeError }
				/>
			</div>
			<p className={ className + '__text' }>
				{ __(
					"Once you've entered the authorization code, click on the button below to proceed."
				) }
			</p>
			<Button
				busy={ connectInProgress }
				disabled={ connectInProgress }
				onClick={ validate }
				primary
			>
				{ buttonMessage }
			</Button>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ heading }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	DomainStepAuthCode
);

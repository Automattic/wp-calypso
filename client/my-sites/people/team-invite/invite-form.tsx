import { Button, FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent, useEffect, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { validateTokens, sendInvites } from 'calypso/state/invites/actions';
import { getTokenValidation, getSendInviteState } from 'calypso/state/invites/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useIncludeFollowers } from './hooks/use-include-followers';
import { useInitialRole } from './hooks/use-initial-role';
import { useInvitingNotifications } from './hooks/use-inviting-notifications';
import { useValidationNotifications } from './hooks/use-validation-notifications';

const TOKEN_CONTROL_MAX_NUM = 10;

function InviteForm() {
	const _ = useTranslate();
	const dispatch = useDispatch();

	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const siteId = site?.ID as number;
	const defaultUserRole = useInitialRole( siteId );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isSiteForTeams = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const { errors: tokenErrors, progress: validationProgress } = useSelector( getTokenValidation );
	const { progress: invitingProgress, success: invitingSuccess } =
		useSelector( getSendInviteState );

	const includeFollowers = useIncludeFollowers( siteId );
	const includeSubscribers = isAtomic;

	// token could be email or username
	const [ tokenValues, setTokenValues ] = useState( [ '' ] );
	const [ tokenControlNum, setTokenControlNum ] = useState( 1 );
	const [ role, setRole ] = useState( defaultUserRole );
	const [ contractor, setContractor ] = useState( false );
	const [ message, setMessage ] = useState( '' );
	const [ showMsg, setShowMsg ] = useState( false );
	const [ showContractorCb, setShowContractorCb ] = useState( false );
	const [ readyForSubmit, setReadyForSubmit ] = useState( false );

	useEffect( extendTokenFormControls, [ tokenValues ] );
	useEffect( toggleShowContractorCb, [ role ] );
	useEffect( checkSubmitReadiness, [ tokenErrors, validationProgress ] );
	useEffect( () => invitingSuccess && resetFormValues(), [ invitingSuccess ] );
	useValidationNotifications();
	useInvitingNotifications( tokenValues );

	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
		if ( ! readyForSubmit || invitingProgress ) {
			return;
		}

		dispatch( sendInvites( siteId, tokenValues, role, message, contractor ) );
		dispatch( recordTracksEvent( 'calypso_invite_people_form_submit' ) );
	}

	function onTokenChange( val: string, i: number ) {
		const value = val.trim();
		const _tokenValues = tokenValues.slice();

		_tokenValues[ i ] = value;
		setTokenValues( _tokenValues );
	}

	function onTokenBlur( i: number ) {
		tokenValues[ i ] && dispatch( validateTokens( siteId, tokenValues, role ) );
	}

	function resetFormValues() {
		setRole( defaultUserRole );
		setTokenValues( [ '' ] );
		setContractor( false );
		setMessage( '' );
	}

	function extendTokenFormControls() {
		const valuesNum = tokenValues.filter( ( x ) => !! x ).length;
		const incrementControlNum =
			valuesNum === tokenControlNum && TOKEN_CONTROL_MAX_NUM > tokenControlNum;

		incrementControlNum && setTokenControlNum( tokenControlNum + 1 );
	}

	function toggleShowContractorCb() {
		// external roles
		const roles = [ 'administrator', 'editor', 'author', 'contributor' ];

		if ( ! isSiteForTeams && roles.includes( role ) ) {
			setShowContractorCb( true );
		} else {
			setContractor( false );
			setShowContractorCb( false );
		}
	}

	function checkSubmitReadiness() {
		const valuesNum = tokenValues.filter( ( x ) => !! x ).length;
		const valuesErrorNum = tokenValues.filter( ( x ) => tokenErrors && !! tokenErrors[ x ] ).length;

		setReadyForSubmit( ! validationProgress && valuesNum > 0 && valuesNum > valuesErrorNum );
	}

	/**
	 * ↓ Render templates
	 */
	function getRoleLearnMoreLink() {
		return (
			<Button
				plain={ true }
				target="_blank"
				href={ localizeUrl( 'https://wordpress.com/support/user-roles/' ) }
			>
				{ _( 'Learn more' ) }
			</Button>
		);
	}

	return (
		<form className="team-invite-form" autoComplete="off" onSubmit={ onFormSubmit }>
			<RoleSelect
				id="role"
				name="role"
				siteId={ siteId }
				onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => setRole( e.target.value ) }
				value={ role }
				disabled={ false }
				includeFollower={ includeFollowers }
				includeSubscriber={ includeSubscribers }
				explanation={ getRoleLearnMoreLink() }
				formControlType="select"
			/>

			{ [ ...Array( tokenControlNum ) ].map( ( v, i ) => (
				<FormFieldset key={ i }>
					{ ! i && <FormLabel htmlFor={ `token-${ i }` }>{ _( 'Email or Username' ) }</FormLabel> }
					<FormTextInput
						id={ `token-${ i }` }
						name={ `token-${ i }` }
						value={ tokenValues[ i ] || '' }
						isError={ tokenErrors && !! tokenErrors[ tokenValues[ i ] ] }
						onBlur={ () => onTokenBlur( i ) }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							onTokenChange( e.target.value, i )
						}
					/>
					{ tokenErrors && tokenErrors[ tokenValues[ i ] ] && (
						<FormInputValidation isError text={ tokenErrors[ tokenValues[ i ] ]?.message } />
					) }
				</FormFieldset>
			) ) }

			{ showContractorCb && (
				<ContractorSelect
					id="contractor"
					disabled={ false }
					checked={ contractor }
					onChange={ ( e ) => setContractor( e.target.checked ) }
				/>
			) }

			<FormFieldset>
				{ ! showMsg && (
					<Button
						className="team-invite-form__add-message"
						primary={ true }
						borderless={ true }
						onClick={ () => setShowMsg( true ) }
					>
						{ _( '+ Add a message' ) }
					</Button>
				) }
				{ showMsg && (
					<>
						<FormLabel htmlFor="message">{ _( 'Message' ) }</FormLabel>
						<FormTextarea
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							id="message"
							value={ message }
							placeholder={ _( 'This message will be sent along with invitation emails.' ) }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setMessage( e.target.value ) }
						/>
					</>
				) }
			</FormFieldset>

			<Button
				type="submit"
				primary
				busy={ invitingProgress }
				className="team-invite-form__submit-btn"
				disabled={ ! readyForSubmit }
			>
				{ _( 'Send invitation' ) }
			</Button>
		</form>
	);
}

export default InviteForm;

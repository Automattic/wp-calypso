import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent, useEffect, FormEvent, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import ContractorSelect from 'calypso/my-sites/people/contractor-select';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { useSelector, useDispatch } from 'calypso/state';
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

interface Props {
	onInviteSuccess?: () => void;
}

function InviteForm( props: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { onInviteSuccess } = props;

	const emailControlPlaceholder = [
		translate( 'sibling@example.com' ),
		translate( 'parents@example.com' ),
		translate( 'friend@example.com' ),
	];
	const defaultEmailControlPlaceholder = translate( 'Add another email or username' );

	const site = useSelector( getSelectedSite );
	const siteId = site?.ID as number;
	const defaultUserRole = useInitialRole( siteId );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isSiteForTeams = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const prevInvitingProgress = useRef();
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

	useEffect( extendTokenFormControls, [ tokenControlNum, tokenValues ] );
	useEffect( toggleShowContractorCb, [ isSiteForTeams, role ] );
	useEffect( checkSubmitReadiness, [
		readyForSubmit,
		tokenErrors,
		tokenValues,
		validationProgress,
	] );
	const resetFormValues = useCallback( () => {
		setRole( defaultUserRole );
		setTokenValues( [ '' ] );
		setContractor( false );
		setMessage( '' );
	}, [ defaultUserRole ] );

	useEffect( reactOnInvitationSuccess, [ invitingSuccess, onInviteSuccess, resetFormValues ] );
	useEffect( () => {
		prevInvitingProgress.current = invitingProgress;
	}, [ invitingProgress ] );
	useValidationNotifications();
	useInvitingNotifications( tokenValues );

	function onFormSubmit( e: FormEvent ) {
		e.preventDefault();
		if ( ! readyForSubmit || invitingProgress ) {
			return;
		}

		const _tokenValues = tokenValues.filter( ( x ) => !! x );

		dispatch( sendInvites( siteId, _tokenValues, role, message, contractor ) );
		dispatch( recordTracksEvent( 'calypso_invite_people_form_submit' ) );
	}

	function tokenValidation( i: number, tokenValues: unknown[] ) {
		tokenValues[ i ] && dispatch( validateTokens( siteId, tokenValues, role ) );
	}

	/**
	 * Add debouncedCallback to prevent API requests on evert keystroke
	 */
	const [ debouncedTokenValidation ] = useDebouncedCallback( tokenValidation, 2000 );

	function onTokenChange( val: string, i: number ) {
		const value = val.trim();
		const _tokenValues = tokenValues.slice();

		_tokenValues[ i ] = value;
		setTokenValues( _tokenValues );
		debouncedTokenValidation( i, _tokenValues );
	}

	function reactOnInvitationSuccess() {
		if ( ! invitingSuccess || ! prevInvitingProgress.current ) {
			return;
		}

		resetFormValues();
		onInviteSuccess?.();
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

		const newReadyForSubmit = ! validationProgress && valuesNum > 0 && valuesNum > valuesErrorNum;
		setReadyForSubmit( newReadyForSubmit );
	}

	/**
	 * ↓ Render templates
	 */
	function getRoleLearnMoreLink() {
		return (
			<Button
				className="team-invite-form-learn-more__link"
				plain
				target="_blank"
				href={ localizeUrl( 'https://wordpress.com/support/user-roles/' ) }
			>
				{ translate( 'Learn more' ) }
			</Button>
		);
	}

	return (
		<form
			autoComplete="off"
			className={ clsx( 'team-invite-form', { 'team-invite-form-valid': readyForSubmit } ) }
			onSubmit={ onFormSubmit }
		>
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
					{ ! i && (
						<FormLabel htmlFor={ `token-${ i }` }>{ translate( 'Email or Username' ) }</FormLabel>
					) }
					<div className="form-field-wrapper">
						<FormTextInput
							id={ `token-${ i }` }
							name={ `token-${ i }` }
							value={ tokenValues[ i ] || '' }
							isError={ tokenErrors && !! tokenErrors[ tokenValues[ i ] ] }
							placeholder={ emailControlPlaceholder[ i ] || defaultEmailControlPlaceholder }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) => {
								onTokenChange( e.target.value, i );
							} }
						/>
						{ tokenValues[ i ] && tokenErrors && ! tokenErrors[ tokenValues[ i ] ] && (
							<div className="form-validation-icon">
								<Icon icon={ check } />
							</div>
						) }
					</div>
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
						primary
						borderless
						onClick={ () => setShowMsg( true ) }
					>
						{ translate( '+ Add a message' ) }
					</Button>
				) }
				{ showMsg && (
					<>
						<FormLabel htmlFor="message">{ translate( 'Message' ) }</FormLabel>
						<FormTextarea
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							id="message"
							value={ message }
							placeholder={ translate( 'This message will be sent along with invitation emails.' ) }
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
			>
				{ translate( 'Send invitation' ) }
			</Button>
		</form>
	);
}

export default InviteForm;

import { Button } from '@wordpress/components';
import { useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import classnames from 'classnames';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import request from 'wpcom-proxy-request';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import './style.scss';

function P2JoinWorkspaces( {
	flowName,
	goToNextStep,
	positionInFlow,
	stepName,
	submitSignupStep,
} ) {
	const CHALLENGE_CODE_LENGTH = 6;
	const CHALLENGE_CODE_ALLOWED_CHARS = /^[a-zA-Z0-9]$/;
	const CHALLENGE_CODE_SELECTOR = 'input.p2-join-workspaces__code-input-box';

	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );
	if ( ! userEmail ) {
		dispatch( fetchCurrentUser() );
	}

	const [ eligibleWorkspaces, setEligibleWorkspaces ] = useState( [] );
	const [ workspaceStatus, setWorkspaceStatus ] = useState( {
		requesting: null,
		requested: null,
		joined: [],
	} );

	const [ isLoading, setIsLoading ] = useState( false );

	// Input from the user.
	const [ challengeCode, setChallengeCode ] = useState( '' );
	const [ codeInputError, setCodeInputError ] = useState( null );

	const fetchList = useCallback( async () => {
		if ( ! userEmail ) {
			return;
		}

		const workspaceList = await request( {
			path: '/p2/preapproved-joining/list-workspaces',
			apiNamespace: 'wpcom/v2',
			global: true,
		} );
		setEligibleWorkspaces( workspaceList );
	}, [ userEmail ] );

	useEffect( () => {
		fetchList();
	}, [ fetchList ] );

	const handleJoinWorkspaceClick = async ( { id, name } ) => {
		// Remember which workspace is being requested, for more accurate loading feedback.
		setWorkspaceStatus( {
			...workspaceStatus,
			requesting: id,
		} );

		const response = await request( {
			path: '/p2/preapproved-joining/request-code',
			apiNamespace: 'wpcom/v2',
			global: true,
			method: 'POST',
			body: {
				hub_id: parseInt( id ),
			},
		} );

		//Test only, REMOVE ME!
		// const response = {
		// 	success: true,
		// 	hub_id: id,
		// };

		if ( response.success ) {
			setWorkspaceStatus( {
				...workspaceStatus,
				requesting: null,
				requested: { id: parseInt( response.hub_id ), name },
			} );
		}
	};

	const handleCodeInputChange = ( event ) => {
		const inputBoxes = event.target.parentNode.querySelectorAll( CHALLENGE_CODE_SELECTOR );
		const newCode = Array.from( inputBoxes ).reduce( ( acc, curr ) => acc + curr.value, '' );
		setChallengeCode( newCode );
	};

	const handleCodeInputKeyPress = ( event ) => {
		// Reject invalid characters.
		if ( event.key.match( CHALLENGE_CODE_ALLOWED_CHARS ) === null ) {
			event.preventDefault();
			return false;
		}

		return true;
	};

	const handleCodeInputKeyUp = ( event ) => {
		const inputBoxes = event.target.parentNode.querySelectorAll( CHALLENGE_CODE_SELECTOR );
		const currentIndex = Array.from( inputBoxes ).indexOf( event.target );
		if ( event.key === 'Backspace' && currentIndex > 0 ) {
			inputBoxes[ currentIndex - 1 ].focus();
		} else if (
			event.key.match( CHALLENGE_CODE_ALLOWED_CHARS ) &&
			currentIndex < inputBoxes.length - 1
		) {
			inputBoxes[ currentIndex + 1 ].focus();
		}

		return true;
	};

	const handleCodeInputPaste = ( event ) => {
		event.preventDefault();
		const text = ( event.clipboardData || window.clipboardData ).getData( 'text' );

		if ( ! text ) {
			return false;
		}

		const chars = text.split( '' ).filter( ( char ) => char.match( CHALLENGE_CODE_ALLOWED_CHARS ) );
		const inputBoxes = event.target.parentNode.querySelectorAll( CHALLENGE_CODE_SELECTOR );
		inputBoxes.forEach( ( box, index ) => {
			if ( index > chars.length - 1 ) {
				return;
			}

			box.value = chars[ index ] || '';
		} );

		// Update challenge code in state.
		const newCode = Array.from( inputBoxes ).reduce( ( acc, curr ) => acc + curr.value, '' );
		setChallengeCode( newCode );

		// Focus on first empty input box, or last if all filled.
		const focusIndex = Math.min( chars.length, inputBoxes.length - 1 );
		inputBoxes[ focusIndex ].focus();

		return false;
	};

	const handleSubmitCode = async () => {
		const hubId = workspaceStatus.requested?.id;
		if ( ! hubId ) {
			return;
		}

		setIsLoading( true );

		await request(
			{
				path: '/p2/preapproved-joining/request-join',
				apiNamespace: 'wpcom/v2',
				global: true,
				method: 'POST',
				body: {
					hub_id: hubId,
					code: challengeCode,
				},
			},
			( err, response ) => {
				setIsLoading( false );

				if ( ! response.success ) {
					setCodeInputError( response.error || __( 'An error has occurred. Please try again.' ) );
					return;
				}

				setWorkspaceStatus( {
					...workspaceStatus,
					requested: null,
					joined: [ ...workspaceStatus.joined, parseInt( response.hub_id ) ],
				} );

				setCodeInputError( null );
			}
		);
	};

	const handleCancelJoin = () => {
		setWorkspaceStatus( { ...workspaceStatus, requested: null } );
		setCodeInputError( null );
	};

	const handleCreateWorkspaceClick = () => {
		submitSignupStep( {
			stepName,
		} );

		goToNextStep();
	};

	const renderWorkspaceActionButton = ( workspaceId, workspaceName ) => {
		if ( ! workspaceStatus.joined.includes( workspaceId ) ) {
			const isBusy = workspaceStatus.requesting === workspaceId;
			return (
				<Button
					className="p2-join-workspaces__action-join"
					onClick={ () => {
						handleJoinWorkspaceClick( {
							id: workspaceId,
							name: workspaceName,
						} );
					} }
					isBusy={ isBusy }
				>
					{ ! isBusy && __( 'Join' ) }
				</Button>
			);
		}

		return (
			<Button className="p2-join-workspaces__action-open-workspace">
				<Icon icon={ chevronRight } />
			</Button>
		);
	};

	const renderEligibleWorkspacesList = () => {
		return (
			<div className="p2-join-workspaces__workspaces-list">
				{ eligibleWorkspaces.map( ( workspace ) => (
					<div className="p2-join-workspaces__workspace" key={ workspace.id }>
						<div className="p2-join-workspaces__workspace-icon">
							{ workspace.name && workspace.name.charAt( 0 ) }
						</div>
						<div className="p2-join-workspaces__workspace-name">
							<a
								className="p2-join-workspaces__workspace-link"
								href={ workspace.site_url }
								target="_blank"
								rel="noreferrer"
							>
								{ workspace.name }
							</a>
						</div>
						<div className="p2-join-workspaces__workspace-description">
							<span>
								{ sprintf(
									/* translators: %(userCount)d is a number */
									_n( '%(userCount)d user', '%(userCount)d users', workspace.user_count ),
									{
										userCount: workspace.user_count,
									}
								) }
							</span>
							<span>
								{ sprintf(
									/* translators: %(siteCount)d is a number */
									_n( '%(siteCount)d P2', '%(siteCount)d P2s', workspace.site_count ),
									{
										siteCount: workspace.site_count,
									}
								) }
							</span>
						</div>
						<div className="p2-join-workspaces__action">
							{ renderWorkspaceActionButton( parseInt( workspace.id ), workspace.name ) }
						</div>
					</div>
				) ) }
			</div>
		);
	};

	const renderCreateWorkspaceSection = () => {
		return (
			<div className="p2-join-workspaces__create-workspace">
				<div className="p2-join-workspaces__create-workspace-header">
					{ __( 'Want to create a new workspace?' ) }
				</div>
				<div className="p2-join-workspaces__create-workspace-subheader">
					{ __( 'Get your team on P2 — for free.' ) }
				</div>
				<div className="p2-join-workspaces__create-workspace-action">
					<Button onClick={ handleCreateWorkspaceClick }>{ __( 'Create a new workspace' ) }</Button>
				</div>
			</div>
		);
	};

	const renderCodeInputBoxes = () => {
		const fieldset = [];
		for ( let index = 0; index < CHALLENGE_CODE_LENGTH; index++ ) {
			fieldset.push(
				<input
					key={ index }
					className="p2-join-workspaces__code-input-box"
					maxLength={ 1 }
					onChange={ ( event ) => {
						handleCodeInputChange( event, index );
					} }
					onKeyPress={ handleCodeInputKeyPress }
					onKeyUp={ handleCodeInputKeyUp }
					onPaste={ handleCodeInputPaste }
					autoFocus={ index === 0 } // eslint-disable-line jsx-a11y/no-autofocus
				/>
			);

			if ( index === CHALLENGE_CODE_LENGTH / 2 - 1 ) {
				fieldset.push(
					<span key="separator" className="p2-join-workspaces__code-input-separator"></span>
				);
			}
		}

		if ( codeInputError ) {
			fieldset.push(
				<div className="p2-join-workspaces__code-input-error">{ codeInputError }</div>
			);
		}

		return fieldset;
	};

	const renderCodeInputForm = () => {
		const formClasses = classnames( 'p2-join-workspaces__code-input-form', {
			'has-error': codeInputError,
		} );

		return (
			<div className="p2-join-workspaces__code-input">
				<div className="p2-join-workspaces__code-input-label">
					{ __( 'Enter the code here, please.' ) }
				</div>
				<form className={ formClasses }>
					<fieldset>{ renderCodeInputBoxes() }</fieldset>
					<Button
						className="p2-join-workspaces__code-input-submit"
						onClick={ handleSubmitCode }
						isPrimary={ true }
						disabled={ challengeCode.length !== CHALLENGE_CODE_LENGTH }
						isBusy={ isLoading }
					>
						{ ! isLoading && __( 'Continue' ) }
					</Button>
					<Button className="p2-join-workspaces__code-input-cancel" onClick={ handleCancelJoin }>
						{ __( 'Cancel' ) }
					</Button>
				</form>
			</div>
		);
	};

	const getHeaderText = () => {
		if ( workspaceStatus.requested?.name ) {
			return createInterpolateElement(
				sprintf(
					/* translators: %s is the site name */
					__( 'Enter the code to join <br />%s' ),
					workspaceStatus.requested.name
				),
				{ br: <br /> }
			);
		}

		return __( 'Welcome to P2!' );
	};

	const getSubHeaderText = () => {
		if ( workspaceStatus.requested?.id ) {
			return createInterpolateElement(
				sprintf(
					/* translators: %s is the email address */
					__( "We've sent an email with a code to <br /><strong>%s</strong>" ),
					userEmail
				),
				{ br: <br />, strong: <strong /> }
			);
		}

		return __( 'A better way of working.' );
	};

	return (
		userEmail && (
			<P2StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ getHeaderText() }
				subHeaderText={ getSubHeaderText() }
			>
				<div className="p2-join-workspaces">
					{ workspaceStatus.requested && renderCodeInputForm() }
					{ ! workspaceStatus.requested && renderEligibleWorkspacesList() }
					{ ! workspaceStatus.requested && renderCreateWorkspaceSection() }
				</div>
			</P2StepWrapper>
		)
	);
}

export default P2JoinWorkspaces;

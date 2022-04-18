import { Button } from '@wordpress/components';
import { useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
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
	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );
	if ( ! userEmail ) {
		dispatch( fetchCurrentUser() );
	}

	const [ eligibleWorkspaces, setEligibleWorkspaces ] = useState( [] );
	const [ workspaceStatus, setWorkspaceStatus ] = useState( { requested: null, joined: [] } );
	// Input from the user.
	const [ challengeCode, setChallengeCode ] = useState( '' );

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
				requested: { id: parseInt( response.hub_id ), name },
				joined: workspaceStatus.joined,
			} );
		}
	};

	const handleCodeInputChange = ( event ) => {
		const inputBoxes = event.target.parentNode.querySelectorAll(
			'input.p2-join-workspaces__code-input-box'
		);
		const newCode = Array.from( inputBoxes ).reduce( ( acc, curr ) => acc + curr.value, '' );
		setChallengeCode( newCode );
	};

	const handleSubmitCode = async () => {
		const hubId = workspaceStatus.requested;
		const response = await request( {
			path: '/p2/preapproved-joining/request-join',
			apiNamespace: 'wpcom/v2',
			global: true,
			method: 'POST',
			body: {
				hub_id: hubId,
				code: challengeCode,
			},
		} );

		if ( response.success ) {
			setWorkspaceStatus( {
				requested: null,
				joined: [ ...workspaceStatus.joined, parseInt( response.hub_id ) ],
			} );
		}
	};

	const handleCancelJoin = () => {
		setWorkspaceStatus( { ...workspaceStatus, requested: null } );
	};

	const handleCreateWorkspaceClick = () => {
		submitSignupStep( {
			stepName,
		} );

		goToNextStep();
	};

	const renderWorkspaceActionButton = ( workspaceId, workspaceName ) => {
		if ( ! workspaceStatus.joined.includes( workspaceId ) ) {
			return (
				<Button
					className="p2-join-workspaces__action-join"
					onClick={ () => {
						handleJoinWorkspaceClick( {
							id: workspaceId,
							name: workspaceName,
						} );
					} }
				>
					{ __( 'Join' ) }
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
							<a className="p2-join-workspaces__workspace-link" href={ workspace.site_url }>
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
		const boxes = [];
		for ( let index = 0; index < CHALLENGE_CODE_LENGTH; index++ ) {
			boxes.push(
				<input
					key={ index }
					className="p2-join-workspaces__code-input-box"
					maxLength={ 1 }
					onChange={ ( event ) => {
						handleCodeInputChange( event, index );
					} }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={ index === 0 }
				/>
			);
		}

		return boxes;
	};

	const renderCodeInputForm = () => {
		return (
			<div className="p2-join-workspaces__code-input">
				<div className="p2-join-workspaces__code-input-label">
					{ __( 'Enter the code here, please.' ) }
				</div>
				<form className="p2-join-workspaces__code-input-form">
					<fieldset>{ renderCodeInputBoxes() }</fieldset>
					<Button
						className="p2-join-workspaces__code-input-submit"
						onClick={ handleSubmitCode }
						isPrimary={ true }
					>
						{ __( 'Continue' ) }
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

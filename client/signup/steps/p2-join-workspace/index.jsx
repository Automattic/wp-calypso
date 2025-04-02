import { Spinner } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import debugFactory from 'debug';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import './style.scss';
import P2JoinWorkspaceCodeInput from './code-input';

const debug = debugFactory( 'calypso:signup:p2-join-workspace' );

function P2JoinWorkspace( { flowName, goToNextStep, positionInFlow, stepName, submitSignupStep } ) {
	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );
	if ( ! userEmail ) {
		dispatch( fetchCurrentUser() );
	}

	const [ isLoading, setIsLoading ] = useState( true );

	const [ eligibleWorkspaces, setEligibleWorkspaces ] = useState( [] );
	const [ workspaceStatus, setWorkspaceStatus ] = useState( {
		requesting: null,
		requested: null,
		joined: [],
	} );

	const fetchList = useCallback( async () => {
		if ( ! userEmail ) {
			return;
		}

		setIsLoading( true );

		const workspaceList = await wpcom.req.get( {
			path: '/p2/preapproved-joining/list-workspaces',
			apiNamespace: 'wpcom/v2',
		} );

		setEligibleWorkspaces( workspaceList );

		setIsLoading( false );
	}, [ userEmail ] );

	useEffect( () => {
		debug( 'Fetching workspace list' );
		fetchList();
	}, [ fetchList ] );

	useEffect( () => {
		if ( eligibleWorkspaces.length > 0 || isLoading ) {
			return;
		}

		submitSignupStep( {
			stepName,
			wasSkipped: true,
		} );

		recordTracksEvent( 'calypso_signup_p2_join_workspace_autoskip' );
		goToNextStep();
	}, [ eligibleWorkspaces, isLoading, submitSignupStep, stepName, goToNextStep ] );

	const handleJoinWorkspaceClick = async ( { id, name } ) => {
		recordTracksEvent( 'calypso_signup_p2_join_workspace_join_request' );

		// Remember which workspace is being requested, for more accurate loading feedback.
		setWorkspaceStatus( {
			...workspaceStatus,
			requesting: id,
		} );

		const response = await wpcom.req.post( {
			path: '/p2/preapproved-joining/request-code',
			apiNamespace: 'wpcom/v2',
			global: true,
			body: {
				hub_id: parseInt( id ),
			},
		} );

		if ( ! response.success ) {
			recordTracksEvent( 'calypso_signup_p2_join_workspace_join_request_fail' );
		}

		recordTracksEvent( 'calypso_signup_p2_join_workspace_join_request_success' );
		setWorkspaceStatus( {
			...workspaceStatus,
			requesting: null,
			requested: { id: parseInt( response.hub_id ), name },
		} );
	};

	const handleCreateWorkspaceClick = () => {
		submitSignupStep( {
			stepName,
		} );

		goToNextStep();
	};

	const renderWorkspaceActionButton = ( { workspaceId, workspaceName, workspaceURL } ) => {
		if ( ! workspaceStatus.joined.includes( workspaceId ) ) {
			const isBusy = workspaceStatus.requesting === workspaceId;
			return (
				<Button
					className="p2-join-workspace__action-join"
					onClick={ () => {
						handleJoinWorkspaceClick( {
							id: workspaceId,
							name: workspaceName,
						} );
					} }
					isBusy={ isBusy }
				>
					{ isBusy ? <Spinner /> : __( 'Join' ) }
				</Button>
			);
		}

		return (
			<Button
				className="p2-join-workspace__action-open-workspace"
				onClick={ () => window.open( workspaceURL, '_blank' ) }
			>
				<Icon icon={ chevronRight } />
			</Button>
		);
	};

	const renderEligibleWorkspacesList = () => {
		return (
			eligibleWorkspaces.length > 0 && (
				<div className="p2-join-workspace__workspace-list">
					{ eligibleWorkspaces.map( ( workspace ) => (
						<div className="p2-join-workspace__workspace" key={ workspace.id }>
							<div className="p2-join-workspace__workspace-icon">
								{ workspace.name && workspace.name.charAt( 0 ) }
							</div>
							<div className="p2-join-workspace__workspace-name">
								<a
									className="p2-join-workspace__workspace-link"
									href={ workspace.site_url }
									target="_blank"
									rel="noreferrer"
								>
									{ workspace.name }
								</a>
							</div>
							<div className="p2-join-workspace__workspace-description">
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
							<div className="p2-join-workspace__action">
								{ renderWorkspaceActionButton( {
									workspaceId: parseInt( workspace.id ),
									workspaceName: workspace.name,
									workspaceURL: workspace.site_url,
								} ) }
							</div>
						</div>
					) ) }
				</div>
			)
		);
	};

	const renderCreateWorkspaceSection = () => {
		return (
			<div className="p2-join-workspace__create-workspace">
				<div className="p2-join-workspace__create-workspace-header">
					{ __( 'Want to create a new workspace?' ) }
				</div>
				<div className="p2-join-workspace__create-workspace-subheader">
					{ __( 'Get your team on P2 — for free.' ) }
				</div>
				<div className="p2-join-workspace__create-workspace-action">
					<Button onClick={ handleCreateWorkspaceClick }>{ __( 'Create a new workspace' ) }</Button>
				</div>
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

		if ( eligibleWorkspaces.length > 0 ) {
			return __( 'Great news! You can join some workspaces right away!' );
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
				showHeaderLogout
			>
				<div className="p2-join-workspace">
					{ isLoading ? (
						<Spinner size={ 30 } />
					) : (
						<>
							{ workspaceStatus.requested ? (
								<P2JoinWorkspaceCodeInput
									workspaceStatus={ workspaceStatus }
									setWorkspaceStatus={ setWorkspaceStatus }
								/>
							) : (
								<>
									{ renderEligibleWorkspacesList() }
									{ renderCreateWorkspaceSection() }
								</>
							) }
						</>
					) }
				</div>
			</P2StepWrapper>
		)
	);
}

export default P2JoinWorkspace;

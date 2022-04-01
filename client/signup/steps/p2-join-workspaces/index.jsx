import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
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

	const handleJoinWorkspaceClick = async ( siteId ) => {
		const response = await request( {
			path: '/p2/preapproved-joining/request-code',
			apiNamespace: 'wpcom/v2',
			global: true,
			method: 'POST',
			body: {
				hub_id: parseInt( siteId ),
			},
		} );

		if ( response.success ) {
			setWorkspaceStatus( {
				requested: parseInt( response.hub_id ),
				joined: workspaceStatus.joined,
			} );
		}
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

	const renderWorkspaceActionButton = ( workspaceId ) => {
		if ( ! workspaceStatus.joined.includes( workspaceId ) ) {
			return (
				<Button
					className="p2-join-workspaces__action-join"
					onClick={ () => {
						handleJoinWorkspaceClick( workspaceId );
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
						<div className="p2-join-workspaces__workspace-name">
							<a href={ workspace.site_url }>{ workspace.name }</a>
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
							{ renderWorkspaceActionButton( parseInt( workspace.id ) ) }
						</div>
					</div>
				) ) }
			</div>
		);
	};

	const renderCreateWorkspaceSection = () => {
		return (
			<Button onClick={ handleCreateWorkspaceClick }>{ __( 'Create a new workspace' ) }</Button>
		);
	};

	const renderCodeInputForm = () => {
		return (
			<div className="p2-join-workspaces__code-input">
				<div className="p2-join-workspaces__code-input-label">
					{ __( 'Enter the code from your workspace invitation email' ) }
				</div>
				<input
					className="p2-join-workspaces__code-input-field"
					type="text"
					placeholder={ __( 'Code' ) }
					onChange={ ( event ) => {
						setChallengeCode( event.target.value );
					} }
				/>
				<Button onClick={ handleSubmitCode } isPrimary={ true }>
					{ __( 'Join' ) }
				</Button>
				<Button onClick={ handleCancelJoin }>{ __( 'Cancel' ) }</Button>
			</div>
		);
	};

	return (
		userEmail && (
			<P2StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ __( 'Welcome to P2!' ) }
				subHeaderText={ __( 'A better way of working' ) }
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

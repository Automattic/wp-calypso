import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
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

	const handleCreateWorkspaceClick = ( option ) => {
		submitSignupStep( {
			stepName,
			option,
		} );

		goToNextStep();
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
					{ eligibleWorkspaces.map( ( workspace ) => (
						<div>
							<div>{ workspace.name }</div>
							<div>
								{ sprintf(
									/* translators: %(userCount)d is a number */
									_n( '%(userCount)d user', '%(userCount)d users', workspace.user_count ),
									{
										userCount: workspace.user_count,
									}
								) }
							</div>
							<div>
								{ sprintf(
									/* translators: %(siteCount)d is a number */
									_n( '%(siteCount)d P2', '%(siteCount)d P2s', workspace.site_count ),
									{
										siteCount: workspace.site_count,
									}
								) }
							</div>
						</div>
					) ) }
				</div>
				<Button onClick={ handleCreateWorkspaceClick } isPrimary={ true }>
					{ __( 'Create a new workspace' ) }
				</Button>
			</P2StepWrapper>
		)
	);
}

export default P2JoinWorkspaces;

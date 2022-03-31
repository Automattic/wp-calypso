import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
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
				headerText={ translate( 'Welcome to P2!' ) }
				subHeaderText={ translate( 'A better way of working' ) }
			>
				<div className="p2-join-workspaces">
					{ eligibleWorkspaces.map( ( workspace ) => (
						<div>{ workspace.name }</div>
					) ) }
				</div>
				<Button onClick={ handleCreateWorkspaceClick } isPrimary={ true }>
					{ translate( 'Create a new workspace' ) }
				</Button>
			</P2StepWrapper>
		)
	);
}

export default P2JoinWorkspaces;

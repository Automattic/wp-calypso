import { Button, Card } from '@automattic/components';
import requestExternalAccess from '@automattic/request-external-access';
import { translate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading/index';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';
import iconGitHub from '../github.svg';

import './style.scss';

type Service = {
	connect_URL: string;
};

export const GithubAuthorizeCard = () => {
	const dispatch = useDispatch();
	const github = useSelector( ( state ) => getKeyringServiceByName( state, 'github' ) ) as Service;
	const handleClick = () => {
		requestExternalAccess( github.connect_URL, () => {
			dispatch( requestKeyringConnections() );
		} );
	};

	return (
		<Card className="github-authorize-card">
			<img className="github-authorize-icon" src={ iconGitHub } alt="" />
			<CardHeading>{ translate( 'Connect GitHub' ) }</CardHeading>
			<p>
				{ translate(
					'Connect this site to a GitHub repository, choose a branch, and deploy with each push.'
				) }
			</p>
			<Button className="is-primary" disabled={ ! github } onClick={ handleClick }>
				{ translate( 'Authorize' ) }
			</Button>
		</Card>
	);
};

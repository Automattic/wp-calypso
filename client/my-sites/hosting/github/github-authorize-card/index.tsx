import { Button, Card } from '@automattic/components';
import requestExternalAccess from '@automattic/request-external-access';
import { translate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import SocialLogo from 'calypso/components/social-logo';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';

import '../style.scss';

type Service = {
	connect_URL: string;
};

export const GithubAuthorizeCard = () => {
	const dispatch = useDispatch();
	const github = useSelector( ( state ) =>
		getKeyringServiceByName( state, 'github-deploy' )
	) as Service;
	const handleClick = () => {
		requestExternalAccess( github.connect_URL, () => {
			dispatch( requestKeyringConnections() );
		} );
	};

	return (
		<Card className="github-hosting-card">
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ translate( 'Deploy from GitHub' ) }</CardHeading>
			<p>
				{ translate(
					'Connect this site to a GitHub repository and automatically deploy branches on push.'
				) }
			</p>
			<Button className="is-primary" disabled={ ! github } onClick={ handleClick }>
				{ translate( 'Authorize access to Github' ) }
			</Button>
		</Card>
	);
};

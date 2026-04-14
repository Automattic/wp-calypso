import { Button, Card, CardBody } from '@wordpress/components';
import { Icon, formatListBullets } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface CreateListInvitationProps {
	onCreateClick?: () => void;
}

export function CreateListInvitation( { onCreateClick }: CreateListInvitationProps ) {
	const translate = useTranslate();

	return (
		<Card className="create-list-invitation">
			<CardBody>
				<div className="create-list-invitation__header">
					<Icon className="create-list-invitation__icon" icon={ formatListBullets } size={ 20 } />
					<span className="create-list-invitation__label">{ translate( 'Share a list' ) }</span>
				</div>
				<p className="create-list-invitation__prompt">{ translate( 'Create your own list' ) }</p>
				<p className="create-list-invitation__description">
					{ translate(
						'Got a favorite corner of the web? Bundle the blogs you follow into a list of your own and help other readers find their next great read. It’s an easy way to support the creators you enjoy and grow community around shared interests.'
					) }
				</p>
				<div className="create-list-invitation__footer">
					<Button variant="primary" href="/reader/list/new" onClick={ onCreateClick }>
						{ translate( 'Create a list' ) }
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}

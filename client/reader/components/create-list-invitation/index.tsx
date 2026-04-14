import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface CreateListInvitationProps {
	onCreateClick?: () => void;
}

export function CreateListInvitation( { onCreateClick }: CreateListInvitationProps ) {
	const translate = useTranslate();

	return (
		<div className="create-list-invitation">
			<h3 className="create-list-invitation__title">{ translate( 'Create your own list' ) }</h3>
			<p className="create-list-invitation__description">
				{ translate(
					'Got a favorite corner of the web? Bundle the blogs you follow into a list of your own and help other readers find their next great read. It’s an easy way to support the creators you enjoy and grow community around shared interests.'
				) }
			</p>
			<Button
				className="create-list-invitation__button"
				variant="primary"
				href="/reader/list/new"
				onClick={ onCreateClick }
			>
				{ translate( 'Create a list' ) }
			</Button>
		</div>
	);
}

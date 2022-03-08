import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useDeleteAppPasswordMutation from 'calypso/data/application-passwords/use-delete-app-password-mutation';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import './style.scss';

function ApplicationPasswordsItem( { password } ) {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const { deleteAppPassword } = useDeleteAppPasswordMutation( {
		onError() {
			dispatch(
				errorNotice(
					translate( 'The application password was not successfully deleted. Please try again.' ),
					{
						duration: 8000,
					}
				)
			);
		},
	} );

	return (
		<li className="application-password-item">
			<div className="application-password-item__details">
				<h2 className="application-password-item__name">{ password.name }</h2>
				<p className="application-password-item__generated">
					{ translate( 'Generated on %s', {
						args: moment( password.generated ).format( 'lll' ),
					} ) }
				</p>
			</div>
			<Button
				borderless
				className="application-password-item__revoke"
				onClick={ () => {
					dispatch( recordGoogleEvent( 'Me', 'Clicked on Remove Application Password Button' ) );
					deleteAppPassword( password.ID );
				} }
			>
				<Gridicon icon="cross" />
			</Button>
		</li>
	);
}

export default ApplicationPasswordsItem;

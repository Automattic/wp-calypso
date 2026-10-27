import { Card, CardHeader, CardBody, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSeenPostsPreferenceEnabled } from 'calypso/reader/data/seen-posts';
import { useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';

export default function PreferencesCard(): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isSeenPostsEnabled = useSeenPostsPreferenceEnabled();

	return (
		<Card>
			<CardHeader>
				<h2 className="user-profile-settings__card-title">{ translate( 'Preferences' ) }</h2>
			</CardHeader>
			<CardBody>
				<ToggleControl
					checked={ isSeenPostsEnabled }
					onChange={ ( checked ) => dispatch( savePreference( 'reader-seen-posts', checked ) ) }
					label={ translate( 'Show read status' ) }
					help={ translate(
						'Marks unread posts with a dot, shows unread counts in the sidebar, and surfaces Mark as read actions.'
					) }
				/>
			</CardBody>
		</Card>
	);
}

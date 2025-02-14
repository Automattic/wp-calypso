import { Button } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import restoreSuccessImage from 'calypso/assets/images/illustrations/jetpack-restore-success.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

interface Props {
	backupDisplayDate: string;
	hasCredentials: boolean;
	siteUrl: string;
	viewSiteClickEventName: string;
}

const RestoreFinished: FunctionComponent< Props > = ( {
	backupDisplayDate,
	hasCredentials,
	siteUrl,
	viewSiteClickEventName,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onViewSiteClick = useCallback( () => {
		dispatch(
			recordTracksEvent( viewSiteClickEventName, {
				has_credentials: hasCredentials,
			} )
		);
	}, [ dispatch, hasCredentials, viewSiteClickEventName ] );
	return (
		<>
			<div className="rewind-flow__header">
				<img src={ restoreSuccessImage } alt="jetpack cloud restore success" />
			</div>
			<h3 className="rewind-flow__title">
				{ translate( 'Your site has been successfully restored.' ) }
			</h3>
			<p className="rewind-flow__info">
				{ translate(
					'All of your selected items are now restored back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<Button
				className="rewind-flow__primary-button"
				href={ siteUrl }
				onClick={ onViewSiteClick }
				target="_blank"
				variant="primary"
			>
				{ translate( 'View your website {{externalIcon/}}', {
					components: { externalIcon: <Icon icon={ external } /> },
				} ) }
			</Button>
		</>
	);
};

export default RestoreFinished;

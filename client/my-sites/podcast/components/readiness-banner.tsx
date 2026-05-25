import { NoticeBanner } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

type Props = {
	issues: string[];
	isPodcastingEnabled: boolean;
	onEditSettings?: () => void;
	className?: string;
};

function ReadinessBanner( { issues, isPodcastingEnabled, onEditSettings, className }: Props ) {
	const translate = useTranslate();

	if ( issues.length === 0 ) {
		return null;
	}

	return (
		<div className={ clsx( 'podcast__settings-readiness', className ) } role="status">
			<NoticeBanner
				level="warning"
				title={
					isPodcastingEnabled
						? ( translate( 'Almost ready to submit' ) as string )
						: ( translate( 'Set up your podcast' ) as string )
				}
				hideCloseButton
				actions={
					onEditSettings
						? [
								<Button
									key="edit-settings"
									variant="primary"
									size="compact"
									onClick={ onEditSettings }
								>
									{ translate( 'Edit settings' ) }
								</Button>,
						  ]
						: undefined
				}
			>
				<p>
					{ translate(
						'Podcast apps like Apple Podcasts and Spotify need this information so they can list your show in their directories and show it to listeners. Add the following to your feed:'
					) }
				</p>
				<ul className="podcast__settings-issues">
					{ issues.map( ( issue ) => (
						<li key={ issue }>{ issue }</li>
					) ) }
				</ul>
			</NoticeBanner>
		</div>
	);
}

export default ReadinessBanner;

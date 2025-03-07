import { ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

type CardContentProps = {
	isReverting: boolean;
	isOwner: boolean;
	progress: number;
};

export const StagingSiteLoadingBarCardContent = ( {
	isReverting,
	progress,
	isOwner,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		if ( isReverting ) {
			return (
				<>
					<ProgressBar
						key="delete-loading-bar"
						value={ progress * 100 }
						className="staging-site-card__loading-bar"
					/>
					<p>{ translate( 'We are deleting your staging site.' ) }</p>
				</>
			);
		}

		const message = isOwner
			? translate( 'We are setting up your staging site. We’ll email you once it is ready.' )
			: translate(
					'We are setting up the staging site. We’ll email the site owner once it is ready.'
			  );
		return (
			<div data-testid="transferring-staging-content">
				<ProgressBar value={ progress * 100 } className="staging-site-card__loading-bar" />
				<p>{ message }</p>
			</div>
		);
	}
};

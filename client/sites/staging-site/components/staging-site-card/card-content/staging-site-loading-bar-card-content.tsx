import { useTranslate } from 'i18n-calypso';
import { ProgressBar } from 'calypso/components/progress-bar';
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
						progress={ progress }
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
				<ProgressBar
					progress={ progress }
					delta={ 0.01 }
					className="staging-site-card__loading-bar"
				/>
				<p>{ message }</p>
			</div>
		);
	}
};

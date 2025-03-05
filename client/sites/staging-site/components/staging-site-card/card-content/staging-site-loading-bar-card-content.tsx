import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { LoadingBar } from 'calypso/components/loading-bar';

const StyledLoadingBar = styled( LoadingBar )( {
	marginBottom: '1em',
} );

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
					<StyledLoadingBar key="delete-loading-bar" progress={ progress } />
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
				<StyledLoadingBar progress={ progress } />
				<p>{ message }</p>
			</div>
		);
	}
};

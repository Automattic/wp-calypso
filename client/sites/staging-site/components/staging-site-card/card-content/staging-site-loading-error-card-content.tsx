import Notice from 'calypso/components/notice';

type CardContentProps = {
	message: string;
	testId?: string;
};

export const StagingSiteLoadingErrorCardContent = ( { message, testId }: CardContentProps ) => {
	{
		return (
			<Notice status="is-error" showDismiss={ false }>
				<div data-testid={ testId }>{ message }</div>
			</Notice>
		);
	}
};

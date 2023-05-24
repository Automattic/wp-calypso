import Notice from 'calypso/components/notice';

type CardContentProps = {
	message: string;
};

export const StagingSiteLoadingErrorCardContent = ( { message }: CardContentProps ) => {
	{
		return (
			<>
				<Notice status="is-error" showDismiss={ false }>
					{ message }
				</Notice>
			</>
		);
	}
};

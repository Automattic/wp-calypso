import { FoldableCard } from '@automattic/components';
import React from 'react';
import { MailboxesCluster } from 'calypso/data/emails/types';
import { getEmailAddress } from 'calypso/lib/emails';

type Props = React.PropsWithChildren< {
	isError?: boolean;
	cluster: MailboxesCluster;
	shouldCluster?: boolean;
} >;

const MailboxListCluster = ( { children, cluster, isError = false, shouldCluster }: Props ) => {
	if ( ! shouldCluster ) {
		return children;
	}
	const emailAddress = getEmailAddress( cluster );

	return (
		<FoldableCard expanded header={ emailAddress } highlight={ isError ? 'error' : null }>
			{ children }
		</FoldableCard>
	);
};

export default MailboxListCluster;

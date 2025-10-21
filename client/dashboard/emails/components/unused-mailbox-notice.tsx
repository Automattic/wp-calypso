import { Link } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addTitanmailMailboxRoute } from '../../app/router/emails';
import { Notice } from '../../components/notice';

interface UnusedMailboxNoticeProps {
	domains: string[];
}

const UnusedMailboxNotice = ( { domains }: UnusedMailboxNoticeProps ) => {
	if ( ! domains?.length ) {
		return null;
	}

	const count = domains.length;
	const title = sprintf(
		/* translators: %d is the number of free mailboxes */
		_n(
			'You have %d free mailbox waiting to be set up.',
			'You have %d free mailboxes waiting to be set up.',
			count
		),
		count
	);

	return (
		<Notice variant="info" title={ title }>
			<VStack spacing={ 4 }>
				<Text as="p">
					{ __( 'Create your mailbox now and start using your custom email address.' ) }
				</Text>
				<VStack spacing={ 2 }>
					{ domains.map( ( domain ) => (
						<HStack key={ domain }>
							<Link to={ addTitanmailMailboxRoute.to }>
								{ sprintf(
									// translators: %s is a domain name
									__( 'Set up mailbox for %s' ),
									domain
								) }
							</Link>
						</HStack>
					) ) }
				</VStack>
			</VStack>
		</Notice>
	);
};

export default UnusedMailboxNotice;

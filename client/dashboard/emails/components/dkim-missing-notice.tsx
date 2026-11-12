import { formatNumber } from '@automattic/number-formatters';
import { ADDING_TITAN_TO_YOUR_SITE } from '@automattic/urls';
import { __experimentalVStack as VStack, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Notice, NoticeActionButton } from '../../components/notice';
import { Text } from '../../components/text';
import { DnsRecordFields } from './titan-dns-records';
import type { DkimMissingEntry } from '../hooks/use-dkim-record-checks';

interface DkimMissingNoticeProps {
	entries: DkimMissingEntry[];
	isChecking: boolean;
	showTryLater: boolean;
	onCheckAgain: () => void;
}

const DkimMissingNotice = ( {
	entries,
	isChecking,
	showTryLater,
	onCheckAgain,
}: DkimMissingNoticeProps ) => {
	if ( ! entries.length ) {
		return null;
	}

	const isSingleDomain = entries.length === 1;

	const title = isSingleDomain
		? sprintf(
				/* translators: %s is a domain name */
				__( 'Add the DKIM record for %s' ),
				entries[ 0 ].domain
			)
		: sprintf(
				/* translators: %s is the number of domains */
				_n(
					'Add the DKIM record for %s domain',
					'Add the DKIM records for %s domains',
					entries.length
				),
				formatNumber( entries.length )
			);

	const description = isSingleDomain
		? __(
				'Mail from this domain can go to spam until you add this TXT record at your DNS host. <learnMoreLink>Learn more</learnMoreLink>'
			)
		: __(
				'Mail from these domains can go to spam until you add these TXT records at your DNS host. <learnMoreLink>Learn more</learnMoreLink>'
			);

	return (
		<Notice
			variant="warning"
			title={ title }
			actions={
				<NoticeActionButton
					variant="solid"
					onClick={ onCheckAgain }
					disabled={ isChecking }
					loading={ isChecking }
				>
					{ __( 'Check again' ) }
				</NoticeActionButton>
			}
		>
			<VStack spacing={ 3 }>
				<Text as="p">
					{ createInterpolateElement( description, {
						learnMoreLink: <ExternalLink href={ ADDING_TITAN_TO_YOUR_SITE } children={ null } />,
					} ) }
				</Text>
				{ entries.map( ( { domain, record } ) => (
					<DnsRecordFields key={ domain } name={ record.name } value={ record.data } />
				) ) }
				{ showTryLater && (
					<Text as="p">
						{ _n(
							'We have not found the record yet. DNS changes can take a few hours to show, so try again later.',
							'We have not found all the records yet. DNS changes can take a few hours to show, so try again later.',
							entries.length
						) }
					</Text>
				) }
			</VStack>
		</Notice>
	);
};

export default DkimMissingNotice;

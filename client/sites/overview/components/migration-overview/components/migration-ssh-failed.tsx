import { copy, globe, Icon, scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { HostingCard } from 'calypso/components/hosting-card';
import { Container, Header } from './layout';

type MigrationFailedListProps = {
	children: ReactElement< MigrationFailedItemProps > | ReactElement< MigrationFailedItemProps >[];
};

type MigrationFailedItemProps = {
	icon: Parameters< typeof Icon >[ 0 ][ 'icon' ];
	text: string;
};

const MigrationFailedList = ( { children }: MigrationFailedListProps ) => (
	<ul className="migration-ssh-failed__list">{ children }</ul>
);

const MigrationFailedItem = ( { icon, text }: MigrationFailedItemProps ) => (
	<li className="migration-ssh-failed__item">
		<div className="migration-ssh-failed__icon-wrapper">
			<Icon icon={ icon } className="migration-ssh-failed__icon" size={ 30 } />
		</div>
		<span>{ text }</span>
	</li>
);

export const MigrationSSHFailed = () => {
	const translate = useTranslate();

	const title = translate( 'We hit a snag, but we’re on it' );
	const subTitle = translate(
		'Your migration ran into an issue but don’t worry — our migration team will take over from here and get your site moved safely.'
	);

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-ssh-failed">
				<HostingCard title={ translate( 'What to expect' ) }>
					<MigrationFailedList>
						<MigrationFailedItem
							icon={ scheduled }
							text={ translate(
								'We’ll investigate what happened and get back to you within a business day with next steps.'
							) }
						/>
						<MigrationFailedItem
							icon={ copy }
							text={ translate(
								'We’ll bring over a copy of your site without affecting your current live version.'
							) }
						/>
						<MigrationFailedItem
							icon={ globe }
							text={ translate(
								'We’ll help you switch your domain after we have completed the migration.'
							) }
						/>
					</MigrationFailedList>
				</HostingCard>
			</div>
		</Container>
	);
};
